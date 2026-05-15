import os
from neo4j import GraphDatabase
from loguru import logger
from typing import List, Dict, Any


class GraphClaimEngine:
    """
    Enterprise Graph Claim Intelligence Engine using Neo4j.
    Models patent claims as directed acyclic graphs (DAGs) to compute structural similarity.
    Nodes = Claim Components, Edges = Functional relationships/Constraints.
    """

    def __init__(self, uri="bolt://localhost:7687", user="neo4j", password=os.environ.get("NEO4J_PASSWORD", "super_secure_graph_pass")):
        self.uri = uri
        try:
            self.driver = GraphDatabase.driver(uri, auth=(user, password))
            logger.info("Connected to Neo4j Graph Database.")
        except Exception as e:
            logger.error(f"Failed to connect to Neo4j. Ensure it's running via docker-compose. Error: {e}")
            self.driver = None

    def close(self):
        if self.driver:
            self.driver.close()

    def create_patent_claim_graph(self, patent_id: str, claims: List[Dict[str, Any]]):
        """
        Ingests a structured parsed claim into Neo4j.
        Creates a Patent node, connects it to Claim nodes, which connect to Component nodes.
        """
        if not self.driver:
            logger.warning("Neo4j driver not initialized. Graph operation skipped.")
            return

        with self.driver.session() as session:
            try:
                # 1. Ensure Patent Node Exists
                session.run(
                    "MERGE (p:Patent {id: $patent_id})", 
                    patent_id=patent_id
                )

                for claim in claims:
                    claim_id = f"{patent_id}_C{claim.get('claim_number', len(claims))}"
                    
                    # 2. Connect Patent -> Claim
                    session.run(
                        """
                        MATCH (p:Patent {id: $patent_id})
                        MERGE (c:Claim {id: $claim_id})
                        MERGE (p)-[:HAS_CLAIM]->(c)
                        """,
                        patent_id=patent_id, claim_id=claim_id
                    )

                    # 3. Process Components
                    components = claim.get('components', [])
                    for comp in components:
                        comp_name = comp.get('name', 'Unknown').lower()
                        # Connect Claim -> Component
                        session.run(
                            """
                            MATCH (c:Claim {id: $claim_id})
                            MERGE (comp:Component {name: $comp_name})
                            MERGE (c)-[:CONTAINS]->(comp)
                            """,
                            claim_id=claim_id, comp_name=comp_name
                        )

                    # 4. Process Relationships (Constraints/Dependencies)
                    dependencies = claim.get('dependencies', [])
                    for dep in dependencies:
                        source = dep.get('source', '').lower()
                        target = dep.get('target', '').lower()
                        relation_type = dep.get('relation', 'CONNECTED_TO').upper().replace(' ', '_')

                        if source and target:
                            session.run(
                                f"""
                                MATCH (s:Component {{name: $source}})
                                MATCH (t:Component {{name: $target}})
                                MERGE (s)-[:{relation_type}]->(t)
                                """,
                                source=source, target=target
                            )
                
                logger.info(f"Successfully ingested claim graph for patent {patent_id}")
            except Exception as e:
                logger.error(f"Failed to create graph for patent {patent_id}: {e}")


    def calculate_structural_similarity(self, patent_id_a: str, patent_id_b: str) -> float:
        """
        Calculates Jaccard similarity of graph edges/components between two patents using Cypher metrics.
        Returns a score from 0.0 to 1.0.
        """
        if not self.driver:
            return 0.5 # Mock score if Neo4j is offline

        query = """
        MATCH (pA:Patent {id: $patA})-[:HAS_CLAIM]->()-[:CONTAINS]->(cA:Component)
        MATCH (pB:Patent {id: $patB})-[:HAS_CLAIM]->()-[:CONTAINS]->(cB:Component)
        
        WITH collect(DISTINCT cA.name) as setA, collect(DISTINCT cB.name) as setB
        
        // Manual intersection calculation in Cypher
        WITH setA, setB, [x IN setA WHERE x IN setB] as intersection
        WITH size(setA) + size(setB) - size(intersection) as union_size, size(intersection) as intersection_size
        
        RETURN CASE 
          WHEN union_size = 0 THEN 0.0 
          ELSE toFloat(intersection_size) / toFloat(union_size) 
        END as similarity
        """

        with self.driver.session() as session:
            try:
                result = session.run(query, patA=patent_id_a, patB=patent_id_b)
                record = result.single()
                return record["similarity"] if record else 0.0
            except Exception as e:
                logger.error(f"Failed graph calculation between {patent_id_a} & {patent_id_b}: {e}")
                return 0.0

# Singleton
graph_engine = GraphClaimEngine()
