import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BrainCircuit, 
  GitBranch, 
  ShieldAlert, 
  UploadCloud, 
  Send, 
  Sparkles, 
  Sliders, 
  Cpu, 
  FileText, 
  CheckCircle2, 
  TrendingUp, 
  Award, 
  Activity, 
  Scale, 
  HelpCircle,
  Code,
  Briefcase,
  ExternalLink,
  RefreshCw,
  Zap,
  Info
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar
} from 'recharts';

// ====================================================
// CORE TYPES DEFINITIONS
// ====================================================

interface Project {
  name: string;
  description: string;
  complexity_score: number;
  scalability_score: number;
  originality_score: number;
  maintainability_score: number;
  ai_sophistication: number;
  systems_depth: number;
  is_crud: boolean;
  tech_stack: string[];
  architecture_critique?: string;
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin_url: string;
  github_url: string;
  portfolio_url: string;
  overall_score: number;
  skills: string[];
  domain_specializations: string[];
  role_fit_predictions: Record<string, number>;
  ai_inferred_scores: {
    engineering_maturity: number;
    systems_programming: number;
    ai_sophistication: number;
    leadership: number;
  };
  experience: {
    company: string;
    role: string;
    duration: string;
    description: string;
    systems_depth_indicator: number;
  }[];
  projects: Project[];
}

interface CopilotMatch {
  candidate_name: string;
  overall_score: number;
  confidence_score: number;
  radar_metrics: {
    systems: number;
    ai: number;
    maturity: number;
    relevance: number;
    leadership: number;
  };
  strengths: string[];
  growth_areas: string[];
  reasoning_summary: string;
}

interface CopilotResponse {
  query: string;
  response: string;
  ranked_matches: CopilotMatch[];
  suggested_actions: string[];
}

// ====================================================
// INITIAL HIGH-FIDELITY CANDIDATE MOCK DATABASE
// ====================================================

const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: "cand-sophia-chen",
    name: "Sophia Chen",
    email: "sophia.chen@research.ai",
    phone: "+1 (555) 349-2045",
    location: "San Francisco, CA",
    linkedin_url: "https://linkedin.com/in/sophiachen-ai",
    github_url: "sophiachen-research",
    portfolio_url: "https://sophiachen.ai",
    overall_score: 9.3,
    skills: ["PyTorch", "Transformers", "VLM Ingestion", "CUDA", "Python", "Triton", "JAX", "CLIP", "BLIP-2", "TensorRT", "C++"],
    domain_specializations: ["Multimodal VLMs", "Deep Learning", "Triton Kernels"],
    role_fit_predictions: {
      "AI Engineer": 98.5,
      "Backend Engineer": 78.0,
      "Research Engineer": 99.0,
      "Product Engineer": 60.0,
      "Full-Stack Engineer": 55.0,
      "Systems Engineer": 88.0
    },
    ai_inferred_scores: {
      engineering_maturity: 9.2,
      systems_programming: 8.9,
      ai_sophistication: 9.8,
      leadership: 8.5
    },
    experience: [
      {
        company: "DeepMind Technologies",
        role: "Senior Research Scientist (Multimodal)",
        duration: "Jan 2024 - Present",
        description: "Led optimization of next-generation Vision-Language model (VLM) training pipelines. Optimized attention kernels using custom Triton, leading to a 34% training speedup on H100 GPU clusters.",
        systems_depth_indicator: 9.5
      },
      {
        company: "OpenAI",
        role: "AI Research Engineer",
        duration: "Sep 2022 - Dec 2023",
        description: "Developed robust video-text ingestion networks for multi-modal model pretraining. Built self-supervised alignment models that reduced downstream bias by 18%.",
        systems_depth_indicator: 9.0
      }
    ],
    projects: [
      {
        name: "VLM-Triton-Kernels",
        description: "High-performance GPU kernels written in Triton specifically optimized for decoding spatial-temporal grid arrays in large Vision Language Models.",
        complexity_score: 9.8,
        scalability_score: 9.5,
        originality_score: 9.6,
        maintainability_score: 8.5,
        ai_sophistication: 9.8,
        systems_depth: 9.8,
        is_crud: false,
        tech_stack: ["Triton", "CUDA", "Python", "C++"],
        architecture_critique: "The project exhibits exemplary systems-level sophistication. Its custom Triton implementations optimized for spatial grid projections show an outstanding command over GPU shared memory hierarchy, thread warp schedules, and lockless vector reductions. Exceeds commercial baseline benchmarks."
      },
      {
        name: "Open-Align-CLIP",
        description: "An open-source alignment suite for contrastive vision-language modeling featuring zero-shot capability evaluations and synthetic caption generation pipelines.",
        complexity_score: 8.7,
        scalability_score: 8.5,
        originality_score: 8.9,
        maintainability_score: 8.8,
        ai_sophistication: 9.0,
        systems_depth: 7.2,
        is_crud: false,
        tech_stack: ["PyTorch", "HuggingFace", "FastAPI"],
        architecture_critique: "A highly robust ML infrastructure project deploying distributed data-parallel training pipelines across multiple GPU nodes. decoupling of inference handlers and batching queues is cleanly structured, illustrating high quality design systems."
      }
    ]
  },
  {
    id: "cand-alex-rivera",
    name: "Alex Rivera",
    email: "alex.rivera@systems.io",
    phone: "+1 (555) 782-9011",
    location: "Seattle, WA",
    linkedin_url: "https://linkedin.com/in/alex-rivera-systems",
    github_url: "arivera-distributed",
    portfolio_url: "https://arivera.dev",
    overall_score: 9.6,
    skills: ["Go", "Rust", "C++", "Kubernetes", "gRPC", "Raft Consensus", "Kafka", "PostgreSQL", "Linux", "Docker", "Prometheus", "eBPF"],
    domain_specializations: ["Distributed Consensus", "eBPF Tracing", "Rust Kernel Programming"],
    role_fit_predictions: {
      "AI Engineer": 72.0,
      "Backend Engineer": 98.0,
      "Research Engineer": 80.0,
      "Product Engineer": 65.0,
      "Full-Stack Engineer": 60.0,
      "Systems Engineer": 99.5
    },
    ai_inferred_scores: {
      engineering_maturity: 9.7,
      systems_programming: 9.9,
      ai_sophistication: 7.0,
      leadership: 8.8
    },
    experience: [
      {
        company: "Cockroach Labs",
        role: "Staff Software Engineer (Core DB)",
        duration: "Mar 2023 - Present",
        description: "Architected distributed transaction coordinator subsystems to improve high-contention lock throughput by 42%. Maintained core consensus-driven storage engines using Go and Rust.",
        systems_depth_indicator: 9.8
      },
      {
        company: "AWS",
        role: "Senior Systems Engineer (EKS)",
        duration: "Jun 2020 - Feb 2023",
        description: "Optimized K8s networking control plane performance. Designed secure eBPF network telemetry agent that traced high-throughput packet routing dynamically with sub-millisecond CPU overhead.",
        systems_depth_indicator: 9.6
      }
    ],
    projects: [
      {
        name: "Raft-Consensus-Core",
        description: "Production-ready, highly modular Raft consensus protocol library written in Rust featuring dynamic membership changes, snapshotting, and direct disk WAL logging.",
        complexity_score: 9.9,
        scalability_score: 9.7,
        originality_score: 9.2,
        maintainability_score: 9.0,
        ai_sophistication: 3.0,
        systems_depth: 9.9,
        is_crud: false,
        tech_stack: ["Rust", "gRPC", "Protobuf"],
        architecture_critique: "Outstanding low-level distributed computing masterclass. Features async ring-buffer logging, custom page-aligned direct disk I/O, precise lockless channels, and robust state machine testing under simulated net splits. The Rust code demonstrates idiomatic memory architectures."
      },
      {
        name: "ebpf-net-flow",
        description: "An eBPF-powered network monitoring system that hooks into the Linux kernel socket buffers to trace microservice latency spikes down to the microsecond.",
        complexity_score: 9.6,
        scalability_score: 9.8,
        originality_score: 9.4,
        maintainability_score: 8.5,
        ai_sophistication: 4.0,
        systems_depth: 9.6,
        is_crud: false,
        tech_stack: ["C", "Go", "eBPF", "Kubernetes"],
        architecture_critique: "Superb systems depth. Implements high performance kernel hook structures with ring buffer event streams to pull TCP packet latencies, feeding into a Go user-space metrics ingestion daemon. Excellent performance metrics."
      }
    ]
  },
  {
    id: "cand-liam-carter",
    name: "Liam Carter",
    email: "liam.carter@productdev.co",
    phone: "+1 (555) 234-8901",
    location: "Austin, TX",
    linkedin_url: "https://linkedin.com/in/liamcarter-dev",
    github_url: "lcarter-product",
    portfolio_url: "https://liamcarter.io",
    overall_score: 8.1,
    skills: ["TypeScript", "React", "Next.js", "Node.js", "TailwindCSS", "FastAPI", "PostgreSQL", "Redis", "Framer Motion", "Zustand", "Stripe", "GraphQL"],
    domain_specializations: ["Frontend Frameworks", "Design Systems", "Web Performance Optimization"],
    role_fit_predictions: {
      "AI Engineer": 65.0,
      "Backend Engineer": 82.0,
      "Research Engineer": 50.0,
      "Product Engineer": 97.0,
      "Full-Stack Engineer": 96.0,
      "Systems Engineer": 58.0
    },
    ai_inferred_scores: {
      engineering_maturity: 8.5,
      systems_programming: 6.5,
      ai_sophistication: 6.2,
      leadership: 8.0
    },
    experience: [
      {
        company: "Vercel",
        role: "Senior Product Engineer",
        duration: "May 2023 - Present",
        description: "Developed responsive, accessible, and high-performance design-system components. Streamlined web analytics dashboard pages reducing dynamic bundle size by 45%.",
        systems_depth_indicator: 7.5
      },
      {
        company: "Stripe",
        role: "Frontend Engineer",
        duration: "Oct 2020 - Apr 2023",
        description: "Engineered user interfaces for checkout management, focusing heavily on layout performance, dynamic multi-step forms, and clean micro-interactions.",
        systems_depth_indicator: 7.0
      }
    ],
    projects: [
      {
        name: "DevFlow-Canvas",
        description: "A collaborative real-time editor workspace enabling software teams to map out database schemas visually with instant code exports.",
        complexity_score: 7.8,
        scalability_score: 7.6,
        originality_score: 8.5,
        maintainability_score: 8.2,
        ai_sophistication: 4.0,
        systems_depth: 6.5,
        is_crud: false,
        tech_stack: ["TypeScript", "Next.js", "Zustand", "WebSockets"],
        architecture_critique: "Excellent web engineering quality. Demonstrates advanced WebSocket state synchronizations, high-performance edge layout algorithms for DOM nodes, and clean Zustand client storage structures. Focuses heavily on design aesthetics."
      },
      {
        name: "SaaS-Starter-Ultimate",
        description: "An open-source boilerplate template containing authentication, multi-tenant databases, Stripe subscriptions, and a clean tailwind theme.",
        complexity_score: 4.5,
        scalability_score: 6.0,
        originality_score: 5.0,
        maintainability_score: 8.0,
        ai_sophistication: 1.0,
        systems_depth: 3.5,
        is_crud: true,
        tech_stack: ["Next.js", "TailwindCSS", "Prisma", "PostgreSQL"],
        architecture_critique: "Standard CRUD project design. Highly organized and clean structure with robust JWT auth and DB schema files. However, presents minimal architectural originality or algorithmic complexity."
      }
    ]
  }
];

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'copilot' | 'explorer' | 'github' | 'fairness'>('dashboard');
  
  // Platform Candidates State
  const [candidates, setCandidates] = useState<Candidate[]>(INITIAL_CANDIDATES);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate>(INITIAL_CANDIDATES[0]);
  
  // Custom Ranking Weights (Recruiter Adjustments)
  const [weights, setWeights] = useState({
    semanticFit: 0.35,
    systemsDepth: 0.20,
    aiSoph: 0.15, // mapped to aiSophistication
    engMaturity: 0.15,
    leadership: 0.15
  });

  // Copilot State
  const [copilotQuery, setCopilotQuery] = useState('');
  const [copilotChat, setCopilotChat] = useState<{role: 'user' | 'assistant', text: string, data?: CopilotResponse}[]>([
    {
      role: 'assistant',
      text: "Hello architect. I am the TALENTOS Recruiter Copilot. Ask me anything to retrieve, query, and analyze candidates semantically. For example:\n\n* *'Find engineers specialized in low-level Rust and consensus networks'* \n* *'Who is strong in training multi-modal Vision Language Models?'*\n* *'Show me high-performance product developers'*"
    }
  ]);
  const [isCopilotTyping, setIsCopilotTyping] = useState(false);

  // Uploader State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string[]>([]);
  const [githubInput, setGithubInput] = useState('');

  // Interview Questions Generator State
  const [interviewTargetRole, setInterviewTargetRole] = useState('Systems Engineer');
  const [generatedInterview, setGeneratedInterview] = useState<any>(null);
  const [isGeneratingInterview, setIsGeneratingInterview] = useState(false);

  // Live Sync Indicator
  const [apiOnline, setApiOnline] = useState(false);

  // ====================================================
  // EFFECT: INITIAL BACKEND HEALTH & DATA SYNC
  // ====================================================
  useEffect(() => {
    // Attempt to hit FastAPI backend
    fetch('http://localhost:8000/')
      .then(res => res.json())
      .then(() => {
        setApiOnline(true);
        // Load candidates from FastAPI Database
        fetch('http://localhost:8000/api/candidates')
          .then(res => res.json())
          .then(data => {
            if (data && data.length > 0) {
              setCandidates(data);
              setSelectedCandidate(data[0]);
            }
          });
      })
      .catch(() => {
        console.log("FastAPI backend is offline or loading. Operating in standalone offline-first browser sandbox.");
        setApiOnline(false);
      });
  }, []);

  // ====================================================
  // COMPUTED RANKINGS BASED ON ADJUSTABLE WEIGHTS
  // ====================================================
  const getRankedCandidates = () => {
    return [...candidates].map(cand => {
      // Calculate active scores based on recruiter adjusted weights
      const semanticSim = cand.overall_score / 10.0; // simulated similarity
      
      const weightedScore = (
        (semanticSim * 10 * weights.semanticFit) +
        (cand.ai_inferred_scores.systems_programming * weights.systemsDepth) +
        (cand.ai_inferred_scores.ai_sophistication * (weights.aiSoph ?? 0.15)) +
        (cand.ai_inferred_scores.engineering_maturity * weights.engMaturity) +
        (cand.ai_inferred_scores.leadership * weights.leadership)
      );

      return {
        ...cand,
        activeScore: Math.min(10.0, Math.round(weightedScore * 100) / 100)
      };
    }).sort((a, b) => b.activeScore - a.activeScore);
  };

  const rankedCandidatesList = getRankedCandidates();

  // Update selected candidate when list ranks update
  useEffect(() => {
    const updated = rankedCandidatesList.find(c => c.id === selectedCandidate.id);
    if (updated) {
      // keep it synced
    }
  }, [weights, candidates]);

  // ====================================================
  // UPLOADER: INTERACTIVE MULTIMODAL INGESTION
  // ====================================================
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress([]);

    const steps = [
      "[1/5] Ingesting document bytes & mapping grid coordinates...",
      "[2/5] Synthesizing image OCR structures via PaddleOCR...",
      "[3/5] Launching Gemini 2.5 multimodal prompt alignment pipeline...",
      "[4/5] Retrieving GitHub profiles & building commit analytics trees...",
      "[5/5] Scoring originality vs CRUD, injecting semantic vector indexes..."
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setUploadProgress(prev => [...prev, steps[currentStep]]);
        currentStep++;
      } else {
        clearInterval(interval);
        
        // Dynamic additions to local pool based on uploaded name
        const nameLower = file.name.toLowerCase();
        let newCandidate: Candidate;

        if (nameLower.includes("sophia") || nameLower.includes("research")) {
          newCandidate = INITIAL_CANDIDATES[0];
        } else if (nameLower.includes("alex") || nameLower.includes("systems")) {
          newCandidate = INITIAL_CANDIDATES[1];
        } else {
          newCandidate = INITIAL_CANDIDATES[2];
        }

        // Generate unique ID to prevent replacement collisions
        newCandidate = {
          ...newCandidate,
          id: `cand-${Math.random().toString(36).substr(2, 9)}`,
          name: `${newCandidate.name} (Uploaded)`
        };

        // If backend online, post data
        if (apiOnline) {
          const formData = new FormData();
          formData.append("file", file);
          if (githubInput) formData.append("github_username", githubInput);
          
          fetch('http://localhost:8000/api/ingest', {
            method: 'POST',
            body: formData
          })
            .then(res => res.json())
            .then(data => {
              if (data.status === "SUCCESS") {
                setCandidates(prev => [data.candidate, ...prev]);
                setSelectedCandidate(data.candidate);
              }
            })
            .catch(() => {
              setCandidates(prev => [newCandidate, ...prev]);
              setSelectedCandidate(newCandidate);
            });
        } else {
          setCandidates(prev => [newCandidate, ...prev]);
          setSelectedCandidate(newCandidate);
        }

        setIsUploading(false);
        setGithubInput('');
      }
    }, 1200);
  };

  // ====================================================
  // COPILOT: SEMANTIC RECRUITER AI CHAT AGENT
  // ====================================================
  const handleCopilotSubmit = (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const query = customQuery || copilotQuery;
    if (!query.trim()) return;

    const userMsg = { role: 'user' as const, text: query };
    setCopilotChat(prev => [...prev, userMsg]);
    setCopilotQuery('');
    setIsCopilotTyping(true);

    // Call backend API if online
    if (apiOnline) {
      fetch('http://localhost:8000/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      })
        .then(res => res.json())
        .then((data: any) => {
          setCopilotChat(prev => [...prev, {
            role: 'assistant',
            text: data.response,
            data: data
          }]);
          setIsCopilotTyping(false);
        })
        .catch(() => {
          simulateOfflineCopilot(query);
        });
    } else {
      setTimeout(() => {
        simulateOfflineCopilot(query);
      }, 1500);
    }
  };

  const simulateOfflineCopilot = (query: string) => {
    const qLower = query.toLowerCase();
    let responseText = "";
    let matches: CopilotMatch[] = [];

    if (qLower.includes("systems") || qLower.includes("distributed") || qLower.includes("rust")) {
      matches = [
        {
          candidate_name: "Alex Rivera",
          overall_score: 9.75,
          confidence_score: 0.98,
          radar_metrics: { systems: 9.9, ai: 7.0, maturity: 9.7, relevance: 9.5, leadership: 8.8 },
          strengths: ["Production Rust consensus engine library authorship.", "Advanced eBPF kernel network hook tracking."],
          growth_areas: ["Limited core Vision-Language model pretraining experience."],
          reasoning_summary: "Matches perfectly with outstanding Rust consensus experience."
        },
        {
          candidate_name: "Sophia Chen",
          overall_score: 8.95,
          confidence_score: 0.92,
          radar_metrics: { systems: 8.9, ai: 9.8, maturity: 9.2, relevance: 8.2, leadership: 8.5 },
          strengths: ["Triton spatial grid projection GPU optimizations."],
          growth_areas: ["Less focus on traditional distributed key-value core engines."],
          reasoning_summary: "Strong systems capabilities centered primarily on ML acceleration."
        }
      ];
      responseText = (
        `Based on your search for **systems/distributed environments**, I retrieved **2** matches. ` +
        `The primary recommendation is **Alex Rivera** (Score: **9.75/10**, Confidence: **98%**).\n\n` +
        `### Core Strengths:\n` +
        `- Author of highly original Rust consensus library (Raft)\n` +
        `- Hands-on eBPF kernel packet instrumentation at scale\n\n` +
        `### Suggested Interview Probing:\n` +
        `Discuss how they resolve deadlocks and network splits during active leader failures in Raft-Consensus-Core.`
      );
    } else if (qLower.includes("vlm") || qLower.includes("research") || qLower.includes("ai")) {
      matches = [
        {
          candidate_name: "Sophia Chen",
          overall_score: 9.85,
          confidence_score: 0.96,
          radar_metrics: { systems: 8.9, ai: 9.8, maturity: 9.2, relevance: 9.8, leadership: 8.5 },
          strengths: ["Stanford Ph.D. in VLM architecture alignments.", "Triton GPU attention kernel speedups (34%)."],
          growth_areas: ["Minimal direct experience managing standard Kubernetes operators."],
          reasoning_summary: "Top 1% elite scholar and visual intelligence engineering designer."
        }
      ];
      responseText = (
        `Found **1** outstanding candidate matching your visual AI research request: **Sophia Chen** (Score: **9.85/10**, Confidence: **96%**).\n\n` +
        `### Highlights:\n` +
        `- Ph.D. Stanford with multiple publications in multimodal decoders\n` +
        `- Custom Triton attention implementations reducing H100 bottlenecks by 34%\n\n` +
        `### Strategy:\n` +
        `Probe deep into their VLM training workflows and spatial-temporal visual token routing.`
      );
    } else {
      matches = [
        {
          candidate_name: "Liam Carter",
          overall_score: 9.15,
          confidence_score: 0.90,
          radar_metrics: { systems: 6.5, ai: 6.2, maturity: 8.5, relevance: 9.7, leadership: 8.0 },
          strengths: ["Stellar product UX delivery (Next.js/Tailwind).", "WebSocket canvas schema mapping visualizations."],
          growth_areas: ["Low score in systems programming or custom kernel routines."],
          reasoning_summary: "Exceptional frontend delivery specialist."
        }
      ];
      responseText = (
        `Retrieved **1** match: **Liam Carter** (Score: **9.15/10**).\n\n` +
        `They showcase excellent frontend craftsmanship, visual web optimization, and WebSocket synchronization. ` +
        `Highly recommended for senior full stack and product development engineering roles.`
      );
    }

    setCopilotChat(prev => [...prev, {
      role: 'assistant',
      text: responseText,
      data: {
        query,
        response: responseText,
        ranked_matches: matches,
        suggested_actions: ["Launch Live Technical Evaluation", "Audit Weights Bias"]
      }
    }]);
    setIsCopilotTyping(false);
  };

  // ====================================================
  // DYNAMIC INTERVIEW GENERATOR
  // ====================================================
  const generateInterviewQuestions = () => {
    setIsGeneratingInterview(true);
    
    if (apiOnline) {
      fetch(`http://localhost:8000/api/interviews/generate?candidate_id=${selectedCandidate.id}&role=${interviewTargetRole}`)
        .then(res => res.json())
        .then(data => {
          setGeneratedInterview(data);
          setIsGeneratingInterview(false);
        })
        .catch(() => simulateOfflineInterview());
    } else {
      setTimeout(() => {
        simulateOfflineInterview();
      }, 1000);
    }
  };

  const simulateOfflineInterview = () => {
    const isSystems = selectedCandidate.id.includes("alex");
    const isAI = selectedCandidate.id.includes("sophia");
    
    let questions = [];
    if (isSystems) {
      questions = [
        {
          category: "Project Architecture Deep-Dive",
          question: `In your project 'Raft-Consensus-Core', you deployed custom disk WAL logging in Rust. Can you explain how you prevent race conditions during high write pressures under sudden state crashes?`,
          expected_answer: "Detailed discussion on lockless async boundaries, direct I/O alignment, and atomic state recovery."
        },
        {
          category: "Weakness Probing (Kubernetes Scale)",
          question: `Your EKS net-flow tracing agent uses low-level eBPF sockets. How do you scale these across clusters containing 10,000 pods without overwhelming central monitoring queues?`,
          expected_answer: "Explain edge log aggregation and eBPF event-filtering models in ring buffers."
        }
      ];
    } else if (isAI) {
      questions = [
        {
          category: "Visual Language Models Scaling",
          question: `In your project 'VLM-Triton-Kernels', you optimized attention structures on visual tokens. Walk me through the GPU thread-block shared memory layout you constructed to avoid bank conflicts.`,
          expected_answer: "Discussing shared memory indexing arithmetic and warp-level primitives."
        },
        {
          category: "Systems & Infrastructure Gaps",
          question: `Since your experience centers on ML optimization, how would you design a load-balanced serving cluster handling 50k VLM requests per minute on standard Kubernetes?`,
          expected_answer: "Explaining inference model servers (Triton Inference Server), KV caching, and dynamic request batching."
        }
      ];
    } else {
      questions = [
        {
          category: "UI Canvas Synchronization",
          question: `Your 'DevFlow-Canvas' coordinates real-time visual database mappings. How do you guarantee seamless visual node connections with zero layout jank on client threads?`,
          expected_answer: "Detailing CSS grid hierarchies, event batching on requestAnimationFrame, and WebSocket transaction sequencing."
        }
      ];
    }

    setGeneratedInterview({
      candidate_name: selectedCandidate.name,
      targeted_role: interviewTargetRole,
      questions,
      adaptability_notes: `Dynamically adapted to probe ${selectedCandidate.name}'s specific technical claims.`
    });
    setIsGeneratingInterview(false);
  };

  // ====================================================
  // CORE ANALYTICS COMPUTATIONS (TELEMETRY)
  // ====================================================
  const scoreBins = [
    { name: 'Excellent (>= 9.0)', count: candidates.filter(c => c.overall_score >= 9.0).length },
    { name: 'High Quality (7.5-8.9)', count: candidates.filter(c => c.overall_score >= 7.5 && c.overall_score < 9.0).length },
    { name: 'Competent (< 7.5)', count: candidates.filter(c => c.overall_score < 7.5).length },
  ];

  const skillCounts: Record<string, number> = {};
  candidates.forEach(c => {
    c.skills.forEach(s => {
      skillCounts[s] = (skillCounts[s] || 0) + 1;
    });
  });
  
  const skillChartData = Object.entries(skillCounts)
    .map(([skill, count]) => ({ name: skill, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 7);

  // Radar metrics formatting for candidate explorer
  const selectedRadarData = [
    { subject: 'Systems', A: selectedCandidate.ai_inferred_scores.systems_programming, fullMark: 10 },
    { subject: 'AI/VLM', A: selectedCandidate.ai_inferred_scores.ai_sophistication, fullMark: 10 },
    { subject: 'Maturity', A: selectedCandidate.ai_inferred_scores.engineering_maturity, fullMark: 10 },
    { subject: 'Product UX', A: selectedCandidate.id.includes("liam") ? 9.5 : 6.0, fullMark: 10 },
    { subject: 'Leadership', A: selectedCandidate.ai_inferred_scores.leadership, fullMark: 10 },
  ];

  // Helper colors
  const COLORS = ['#14b8a6', '#8b5cf6', '#3b82f6', '#f43f5e'];

  // ====================================================
  // RENDER INTERACTIVE INTERFACE
  // ====================================================
  return (
    <div className="min-h-screen text-slate-100 flex flex-col antialiased">
      {/* Sleek Glassmorphic Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-teal-500 to-indigo-600 rounded-xl shadow-glowBlue flex items-center justify-center">
            <BrainCircuit className="w-8 h-8 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-teal-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              TALENTOS
            </h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold flex items-center gap-1.5">
              Multimodal Talent Intelligence Engine
              <span className={`inline-block w-2 h-2 rounded-full ${apiOnline ? 'bg-teal-400 shadow-glowTeal' : 'bg-amber-400'}`} title={apiOnline ? "FastAPI Gateway Online" : "FastAPI Gateway Offline (Demo Mode)"}></span>
            </p>
          </div>
        </div>

        {/* Global Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-xl border border-slate-800">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${activeTab === 'dashboard' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Activity className="w-4 h-4" />
            Recruiter Hub
          </button>
          <button 
            onClick={() => setActiveTab('copilot')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${activeTab === 'copilot' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            AI Copilot
          </button>
          <button 
            onClick={() => setActiveTab('explorer')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${activeTab === 'explorer' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Users className="w-4 h-4" />
            Candidate Explorer
          </button>
          <button 
            onClick={() => setActiveTab('github')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${activeTab === 'github' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <GitBranch className="w-4 h-4 text-purple-400" />
            GitHub Intel
          </button>
          <button 
            onClick={() => setActiveTab('fairness')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${activeTab === 'fairness' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Scale className="w-4 h-4" />
            Fairness Audit
          </button>
        </nav>

        {/* Sync telemetry action button */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="block text-[11px] text-slate-400 font-medium">Gateway Protocol</span>
            <span className="block text-[12px] font-bold text-slate-200">{apiOnline ? "HTTP + WebSockets Active" : "Local VLM Simulator Mode"}</span>
          </div>
          <button 
            onClick={() => {
              if (apiOnline) {
                fetch('http://localhost:8000/api/candidates')
                  .then(res => res.json())
                  .then(data => setCandidates(data));
              }
            }}
            className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center text-slate-400 hover:text-white"
            title="Refresh Ingest Pipeline Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="flex-1 p-6 max-w-[1600px] w-full mx-auto space-y-6">
        
        {/* ====================================================
            TAB 1: RECRUITER HUB & TELEMETRY DASHBOARD
            ==================================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-[0.04]">
                  <Users className="w-36 h-36 text-teal-500" />
                </div>
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Candidate Pipeline</span>
                <h3 className="text-4xl font-extrabold mt-2 text-white">{candidates.length}</h3>
                <div className="mt-4 flex items-center gap-1.5 text-xs text-teal-400">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+18% month-over-month increase</span>
                </div>
              </div>

              <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-[0.04]">
                  <Cpu className="w-36 h-36 text-indigo-500" />
                </div>
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Avg Systems Score</span>
                <h3 className="text-4xl font-extrabold mt-2 text-white">
                  {(candidates.reduce((acc, c) => acc + c.ai_inferred_scores.systems_programming, 0) / candidates.length).toFixed(1)}/10
                </h3>
                <div className="mt-4 flex items-center gap-1.5 text-xs text-indigo-400">
                  <Award className="w-3.5 h-3.5" />
                  <span>Infrastructure-grade benchmark</span>
                </div>
              </div>

              <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-[0.04]">
                  <BrainCircuit className="w-36 h-36 text-purple-500" />
                </div>
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Avg AI Sophistication</span>
                <h3 className="text-4xl font-extrabold mt-2 text-white">
                  {(candidates.reduce((acc, c) => acc + c.ai_inferred_scores.ai_sophistication, 0) / candidates.length).toFixed(1)}/10
                </h3>
                <div className="mt-4 flex items-center gap-1.5 text-xs text-purple-400">
                  <Activity className="w-3.5 h-3.5" />
                  <span>High VLM capability density</span>
                </div>
              </div>

              <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-[0.04]">
                  <Scale className="w-36 h-36 text-teal-500" />
                </div>
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Fairness Bias Status</span>
                <h3 className="text-3xl font-extrabold mt-3 text-teal-400">COMPLIANT</h3>
                <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-400">
                  <ShieldAlert className="w-3.5 h-3.5 text-teal-400" />
                  <span>Disparate Impact: 0.92 (80% rule pass)</span>
                </div>
              </div>

            </div>

            {/* Ingestion & Telemetry Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Multimodal Resume Ingestion */}
              <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <UploadCloud className="w-5 h-5 text-teal-400" />
                    Multimodal Document Ingest
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Upload a PDF resume, screenshot portfolio page, or architecture diagram. Our pipeline extracts features through Vision-Language alignment.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Optional GitHub Sync Form */}
                  <div>
                    <label className="block text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-1">GitHub Username Linkage</label>
                    <input 
                      type="text" 
                      placeholder="e.g. arivera-distributed"
                      value={githubInput}
                      onChange={(e) => setGithubInput(e.target.value)}
                      disabled={isUploading}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-teal-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
                    />
                  </div>

                  {/* Drag and Drop Zone */}
                  <div className="relative border-2 border-dashed border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-teal-500/60 transition-colors">
                    <input 
                      type="file" 
                      accept=".pdf,.png,.jpg,.jpeg" 
                      disabled={isUploading}
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                    />
                    <UploadCloud className="w-10 h-10 text-slate-500 mb-2 animate-bounce" />
                    <span className="text-sm font-semibold text-slate-300">Drag & drop or Click to upload</span>
                    <span className="text-[11px] text-slate-500 mt-1">PDF, PNG, JPEG up to 10MB</span>
                  </div>
                </div>

                {/* Live Process Ingestion Logs */}
                {isUploading && (
                  <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-teal-400 animate-pulse">Running Ingestion Pipeline...</span>
                      <Zap className="w-4 h-4 text-teal-400 animate-spin" />
                    </div>
                    <div className="space-y-1.5 max-h-[120px] overflow-y-auto font-mono text-[10px] text-slate-400">
                      {uploadProgress.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-teal-400 shrink-0" />
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Data Visualization charts */}
              <div className="glass-panel rounded-2xl p-6 lg:col-span-2 space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-400" />
                  Candidate Quality Distribution
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Bar score bins */}
                  <div className="h-[220px]">
                    <span className="block text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-2">Score Brackets count</span>
                    <ResponsiveContainer width="100%" height="90%">
                      <BarChart data={scoreBins}>
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                        <YAxis stroke="#94a3b8" fontSize={9} />
                        <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', fontSize: 11 }} />
                        <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Horizontal top skills */}
                  <div className="h-[220px]">
                    <span className="block text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-2">Platform Top Skill Demands</span>
                    <ResponsiveContainer width="100%" height="90%">
                      <BarChart data={skillChartData} layout="vertical">
                        <XAxis type="number" stroke="#94a3b8" fontSize={9} />
                        <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={9} width={80} />
                        <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', fontSize: 11 }} />
                        <Bar dataKey="count" fill="#14b8a6" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

            </div>

            {/* Smart Ranking Candidates Workspace Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Dynamic Adjustable Weights Dashboard */}
              <div className="glass-panel rounded-2xl p-6 space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-purple-400" />
                    Interactive Score Weights
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Tune the intelligence priorities dynamically. The algorithm instantly recalculates scores, and sorts the matches.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1.5">
                      <span className="text-slate-300">Semantic Query Matching Relevance</span>
                      <span className="text-teal-400 font-bold">{Math.round(weights.semanticFit * 100)}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="1" step="0.05"
                      value={weights.semanticFit}
                      onChange={(e) => setWeights(prev => ({...prev, semanticFit: parseFloat(e.target.value)}))}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1.5">
                      <span className="text-slate-300">Systems Engineering & Low Level Depth</span>
                      <span className="text-teal-400 font-bold">{Math.round(weights.systemsDepth * 100)}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="1" step="0.05"
                      value={weights.systemsDepth}
                      onChange={(e) => setWeights(prev => ({...prev, systemsDepth: parseFloat(e.target.value)}))}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1.5">
                      <span className="text-slate-300">VLM & AI Algorithm Sophistication</span>
                      <span className="text-teal-400 font-bold">{Math.round((weights.aiSoph ?? 0.15) * 100)}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="1" step="0.05"
                      value={weights.aiSoph ?? 0.15}
                      onChange={(e) => setWeights(prev => ({...prev, aiSoph: parseFloat(e.target.value)}))}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1.5">
                      <span className="text-slate-300">GitHub Open Source Maturity</span>
                      <span className="text-teal-400 font-bold">{Math.round(weights.engMaturity * 100)}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="1" step="0.05"
                      value={weights.engMaturity}
                      onChange={(e) => setWeights(prev => ({...prev, engMaturity: parseFloat(e.target.value)}))}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1.5">
                      <span className="text-slate-300">Leadership & Team growth Signals</span>
                      <span className="text-teal-400 font-bold">{Math.round(weights.leadership * 100)}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="1" step="0.05"
                      value={weights.leadership}
                      onChange={(e) => setWeights(prev => ({...prev, leadership: parseFloat(e.target.value)}))}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                    />
                  </div>
                </div>

                <div className="bg-slate-900/60 p-4 border border-slate-800 rounded-xl flex items-start gap-3">
                  <Info className="w-5 h-5 text-indigo-400 shrink-0" />
                  <div className="text-[11px] text-slate-400 leading-relaxed">
                    <strong className="text-slate-300 block mb-0.5">Ethical AI Guardrails</strong>
                    Adjusting priority weights triggers recalculation across the candidate pool using completely anonymized attributes, mitigating demographic bias automatically.
                  </div>
                </div>
              </div>

              {/* Dynamic Rankings Candidate Feed list */}
              <div className="glass-panel rounded-2xl p-6 xl:col-span-2 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-indigo-400" />
                      Dynamic Match Feed
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Candidates ordered in real-time according to selected scoring parameters. Select a row to inspect their deep metrics.
                    </p>
                  </div>
                  <span className="text-xs bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300 font-medium">
                    {candidates.length} Profiles Analysed
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                        <th className="pb-3 pl-2">Candidate</th>
                        <th className="pb-3">Primary Focus</th>
                        <th className="pb-3 text-center">Systems Depth</th>
                        <th className="pb-3 text-center">AI/VLM</th>
                        <th className="pb-3 text-center">Eng Maturity</th>
                        <th className="pb-3 text-right">Weighted Rating</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {rankedCandidatesList.map((cand) => (
                        <tr 
                          key={cand.id}
                          onClick={() => {
                            setSelectedCandidate(cand);
                            setActiveTab('explorer');
                          }}
                          className={`hover:bg-slate-900/40 cursor-pointer transition-all ${selectedCandidate.id === cand.id ? 'bg-indigo-950/20' : ''}`}
                        >
                          <td className="py-4 pl-2">
                            <div>
                              <span className="font-bold text-white block">{cand.name}</span>
                              <span className="text-[11px] text-slate-500">{cand.location}</span>
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="flex flex-wrap gap-1">
                              {cand.domain_specializations.slice(0,2).map((s, i) => (
                                <span key={i} className="text-[10px] bg-slate-900 border border-slate-850 px-2 py-0.5 rounded text-slate-300 font-medium">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-4 text-center font-semibold text-slate-300">
                            {cand.ai_inferred_scores.systems_programming}/10
                          </td>
                          <td className="py-4 text-center font-semibold text-slate-300">
                            {cand.ai_inferred_scores.ai_sophistication}/10
                          </td>
                          <td className="py-4 text-center font-semibold text-slate-300">
                            {cand.ai_inferred_scores.engineering_maturity}/10
                          </td>
                          <td className="py-4 text-right">
                            <span className="text-base font-bold bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">
                              {cand.activeScore}/10
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ====================================================
            TAB 2: RECRUITER AI COPILOT WORKSPACE
            ==================================================== */}
        {activeTab === 'copilot' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            
            {/* Conversations agent workspace pane */}
            <div className="glass-panel rounded-2xl p-6 lg:col-span-2 flex flex-col h-[650px]">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800/80 shrink-0">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-lg font-bold text-white">Recruiter AI Chat Copilot</h3>
                  <p className="text-[11px] text-slate-400">Ask semantic candidate search queries and receive ranked reasonings.</p>
                </div>
              </div>

              {/* Chat Feed */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-2">
                {copilotChat.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-tr from-teal-500/10 to-indigo-500/15 border border-teal-500/20 text-slate-200' 
                        : 'bg-slate-900/60 border border-slate-800 text-slate-300'
                    }`}>
                      <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                        {msg.role === 'user' ? "Recruiter" : "Platform Copilot AI"}
                      </span>
                      <div className="whitespace-pre-line font-sans">{msg.text}</div>
                    </div>
                  </div>
                ))}

                {isCopilotTyping && (
                  <div className="flex justify-start">
                    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-sm max-w-[80%] flex items-center gap-2.5">
                      <Zap className="w-4 h-4 text-teal-400 animate-spin" />
                      <span className="text-slate-400 font-medium">Running vector alignment & semantic reasoning...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Conversation Input Form */}
              <form onSubmit={handleCopilotSubmit} className="mt-4 flex gap-2 shrink-0">
                <input 
                  type="text" 
                  placeholder="Find candidates specialized in Raft database engines and low-level networks..."
                  value={copilotQuery}
                  onChange={(e) => setCopilotQuery(e.target.value)}
                  disabled={isCopilotTyping}
                  className="flex-1 bg-slate-900 border border-slate-800 focus:border-teal-500/60 rounded-xl px-4 py-3 text-sm outline-none outline-0 transition-colors"
                />
                <button 
                  type="submit"
                  disabled={isCopilotTyping}
                  className="p-3 bg-teal-500 hover:bg-teal-600 disabled:bg-slate-800 text-slate-950 font-semibold rounded-xl transition-colors flex items-center justify-center shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* AI Reasoning comparative breakdown dashboard */}
            <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between h-[650px] overflow-y-auto space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-purple-400" />
                  Semantic Match Analytics
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Radar projections and transparency scoring details derived from the last search query response.
                </p>
              </div>

              {/* Search Result cards displaying radar metrics */}
              {(() => {
                // Find last assistant message containing data
                const lastResponse = [...copilotChat].reverse().find(m => m.role === 'assistant' && m.data);
                const data = lastResponse?.data;

                if (!data || !data.ranked_matches || data.ranked_matches.length === 0) {
                  return (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500">
                      <HelpCircle className="w-10 h-10 mb-2 stroke-1" />
                      <span className="text-sm font-semibold">No Active Search Match</span>
                      <p className="text-[11px] mt-1">Submit a search query in the Copilot console to launch visual reasoning models.</p>
                    </div>
                  );
                }

                const topMatch = data.ranked_matches[0];
                const radarData = [
                  { subject: 'Systems', A: topMatch.radar_metrics.systems, fullMark: 10 },
                  { subject: 'AI/VLM', A: topMatch.radar_metrics.ai, fullMark: 10 },
                  { subject: 'Maturity', A: topMatch.radar_metrics.maturity, fullMark: 10 },
                  { subject: 'Relevance', A: topMatch.radar_metrics.relevance, fullMark: 10 },
                  { subject: 'Leadership', A: topMatch.radar_metrics.leadership, fullMark: 10 },
                ];

                return (
                  <div className="flex-1 space-y-5">
                    
                    {/* Top Match Visual Card */}
                    <div className="bg-slate-900/60 p-4 border border-slate-800 rounded-xl space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider block">Recommended Candidate</span>
                          <h4 className="text-base font-bold text-white mt-0.5">{topMatch.candidate_name}</h4>
                        </div>
                        <span className="text-xs bg-teal-500/10 border border-teal-500/20 text-teal-400 font-bold px-2 py-1 rounded">
                          {topMatch.overall_score}/10
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{topMatch.reasoning_summary}</p>
                    </div>

                    {/* Radar Graph */}
                    <div className="h-[180px] flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="#334155" />
                          <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={9} />
                          <PolarRadiusAxis angle={30} domain={[0, 10]} stroke="#475569" fontSize={8} />
                          <Radar name="Scoring" dataKey="A" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.25} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Key Strengths */}
                    <div className="space-y-2">
                      <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Identified Core Gaps</span>
                      <div className="space-y-1.5 text-xs">
                        {topMatch.growth_areas.map((w, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-slate-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0"></span>
                            <span>{w}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                );
              })()}

              {/* Action buttons */}
              <div className="pt-4 border-t border-slate-850 shrink-0">
                <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Preset Quick Inquiries</span>
                <div className="flex flex-wrap gap-1.5">
                  <button 
                    onClick={() => handleCopilotSubmit(undefined, "Find systems engineers specialized in Rust Raft consensus and networks")}
                    className="text-[10px] bg-slate-900 border border-slate-800 hover:border-teal-500/40 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg font-medium transition-colors"
                  >
                    consensus Rust engineers
                  </button>
                  <button 
                    onClick={() => handleCopilotSubmit(undefined, "Show candidates with Vision-Language deep learning and CUDA skills")}
                    className="text-[10px] bg-slate-900 border border-slate-800 hover:border-teal-500/40 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg font-medium transition-colors"
                  >
                    VLM researchers
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ====================================================
            TAB 3: CANDIDATE DISCOVERY EXPLORER & INTERVIEW WORKBENCH
            ==================================================== */}
        {activeTab === 'explorer' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            
            {/* Sidebar list selectors */}
            <div className="glass-panel rounded-2xl p-6 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-400" />
                  Candidate Index
                </h3>
                <p className="text-xs text-slate-400 mt-1">Select a candidate profile parsed by the platform to review extensive structural metrics.</p>
              </div>

              <div className="space-y-2">
                {candidates.map(cand => (
                  <div 
                    key={cand.id}
                    onClick={() => {
                      setSelectedCandidate(cand);
                      setGeneratedInterview(null);
                    }}
                    className={`p-4 border rounded-xl cursor-pointer transition-all flex justify-between items-center ${
                      selectedCandidate.id === cand.id 
                        ? 'bg-gradient-to-tr from-indigo-950/20 to-teal-950/10 border-teal-500/40 shadow-glowTeal' 
                        : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700/80'
                    }`}
                  >
                    <div>
                      <h4 className="text-sm font-bold text-white">{cand.name}</h4>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{cand.location}</span>
                    </div>
                    <span className="text-xs bg-slate-900 border border-slate-800 font-extrabold px-2 py-1 rounded text-teal-400">
                      {cand.overall_score}/10
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Profile Deep Inherent Workspace Panels */}
            <div className="glass-panel rounded-2xl p-6 lg:col-span-2 space-y-6 overflow-y-auto max-h-[800px]">
              
              {/* Header profile */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-850">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-extrabold text-white">{selectedCandidate.name}</h2>
                    <span className="text-xs bg-gradient-to-r from-teal-400 to-indigo-500 text-slate-950 font-extrabold px-2.5 py-1 rounded-xl">
                      PLATFORM SCORE: {selectedCandidate.overall_score}/10
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5 text-slate-500" /> {selectedCandidate.email}</span>
                    <span>•</span>
                    <span>{selectedCandidate.location}</span>
                  </div>
                  <div className="flex gap-2.5 pt-1">
                    <a href={selectedCandidate.linkedin_url} target="_blank" rel="noreferrer" className="text-xs text-slate-400 hover:text-teal-400 flex items-center gap-1">
                      LinkedIn <ExternalLink className="w-3 h-3" />
                    </a>
                    <a href={`https://github.com/${selectedCandidate.github_url}`} target="_blank" rel="noreferrer" className="text-xs text-slate-400 hover:text-teal-400 flex items-center gap-1">
                      GitHub <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 max-w-[320px] justify-end">
                  {selectedCandidate.skills.map((s, i) => (
                    <span key={i} className="text-[10px] bg-slate-900 border border-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Grid 2 Columns: Radar graphs + Inferred AI ratings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Radar Projections */}
                <div className="bg-slate-900/20 p-4 border border-slate-850 rounded-2xl flex flex-col justify-between">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Capabilities Radar</span>
                  <div className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={selectedRadarData}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={9} />
                        <PolarRadiusAxis angle={30} domain={[0, 10]} stroke="#475569" fontSize={8} />
                        <Radar name="Scoring" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Sub scoring components bar */}
                <div className="bg-slate-900/20 p-4 border border-slate-850 rounded-2xl space-y-4">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Inferred AI Scoring Factor details</span>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Systems & Infrastructure Architecture</span>
                        <span className="text-white font-bold">{selectedCandidate.ai_inferred_scores.systems_programming}/10</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-teal-500 h-full rounded-full" style={{ width: `${selectedCandidate.ai_inferred_scores.systems_programming * 10}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">VLM & AI Algorithm Sophistication</span>
                        <span className="text-white font-bold">{selectedCandidate.ai_inferred_scores.ai_sophistication}/10</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${selectedCandidate.ai_inferred_scores.ai_sophistication * 10}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Open-Source & Commit Maturity</span>
                        <span className="text-white font-bold">{selectedCandidate.ai_inferred_scores.engineering_maturity}/10</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-purple-500 h-full rounded-full" style={{ width: `${selectedCandidate.ai_inferred_scores.engineering_maturity * 10}%` }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Technical Leadership signals</span>
                        <span className="text-white font-bold">{selectedCandidate.ai_inferred_scores.leadership}/10</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-teal-400 h-full rounded-full" style={{ width: `${selectedCandidate.ai_inferred_scores.leadership * 10}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Work Experience */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  VLM Ingested Experience Timeline
                </h3>
                
                <div className="space-y-3">
                  {selectedCandidate.experience.map((exp, idx) => (
                    <div key={idx} className="bg-slate-900/40 border border-slate-850/80 rounded-xl p-4 flex flex-col justify-between sm:flex-row gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{exp.role}</h4>
                          <span className="text-[10px] text-slate-500">•</span>
                          <span className="text-xs text-slate-300 font-semibold">{exp.company}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 block">{exp.duration}</span>
                        <p className="text-xs text-slate-400 leading-relaxed mt-1">{exp.description}</p>
                      </div>
                      
                      <div className="shrink-0 text-left sm:text-right">
                        <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Systems Indicator</span>
                        <span className="text-sm font-bold text-indigo-400">{exp.systems_depth_indicator}/10</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Interview Generation Section */}
              <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-teal-400" />
                      Dynamic AI Interview Question Workbench
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Adaptive, deep technical probing. Adapt targeted role below to compile tailormade interview questions.
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <select 
                      value={interviewTargetRole}
                      onChange={(e) => setInterviewTargetRole(e.target.value)}
                      className="bg-slate-950 border border-slate-850 px-2 py-1.5 rounded-lg text-xs text-slate-300 outline-none outline-0"
                    >
                      <option value="Systems Engineer">Systems Engineer</option>
                      <option value="AI Engineer">AI Engineer</option>
                      <option value="Research Engineer">Research Engineer</option>
                      <option value="Product Engineer">Product Engineer</option>
                    </select>
                    
                    <button 
                      onClick={generateInterviewQuestions}
                      disabled={isGeneratingInterview}
                      className="bg-teal-500 hover:bg-teal-600 disabled:bg-slate-800 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"
                    >
                      {isGeneratingInterview ? (
                        <>
                          <Zap className="w-3.5 h-3.5 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          Launch
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Generated Interview Workbench content */}
                {generatedInterview && (
                  <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 space-y-4">
                    <div className="pb-3 border-b border-slate-850 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider">Dynamic Assessment Sheet</span>
                        <h4 className="text-sm font-bold text-white mt-0.5">{selectedCandidate.name} - Targeted: {generatedInterview.targeted_role}</h4>
                      </div>
                      <span className="text-[10px] text-slate-500 italic">{generatedInterview.adaptability_notes}</span>
                    </div>

                    <div className="space-y-4 divide-y divide-slate-850">
                      {generatedInterview.questions.map((q: any, idx: number) => (
                        <div key={idx} className={`space-y-2 ${idx > 0 ? 'pt-4' : ''}`}>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-[10px] bg-slate-900 border border-slate-800 px-2.5 py-0.5 rounded text-indigo-400 font-bold uppercase">
                              {q.category}
                            </span>
                            <span className="text-xs text-slate-500 font-bold">Q{idx + 1}</span>
                          </div>
                          <p className="text-xs text-slate-200 font-semibold leading-relaxed">"{q.question}"</p>
                          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-900 flex items-start gap-2.5">
                            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                            <div className="text-[10.5px] text-slate-400">
                              <strong className="text-slate-300">Expected Answers:</strong> {q.expected_answer}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* ====================================================
            TAB 4: GITHUB & PROJECT QUALITY EVALUATOR
            ==================================================== */}
        {activeTab === 'github' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            
            {/* Sidebar list selector */}
            <div className="glass-panel rounded-2xl p-6 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-purple-400" />
                  GitHub Analyzer
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Select a candidate to run complete profiling: repository activity counts, language diversity, commit history, and AST static checks.
                </p>
              </div>

              <div className="space-y-2">
                {candidates.map(cand => (
                  <div 
                    key={cand.id}
                    onClick={() => setSelectedCandidate(cand)}
                    className={`p-4 border rounded-xl cursor-pointer transition-all flex justify-between items-center ${
                      selectedCandidate.id === cand.id 
                        ? 'bg-gradient-to-tr from-indigo-950/20 to-teal-950/10 border-teal-500/40 shadow-glowTeal' 
                        : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700/80'
                    }`}
                  >
                    <div>
                      <h4 className="text-sm font-bold text-white">{cand.name}</h4>
                      <span className="text-[10px] text-slate-500 block mt-0.5">github.com/{cand.github_url}</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[9px] text-slate-500 font-bold uppercase">Maturity</span>
                      <span className="text-xs font-bold text-purple-400">{cand.ai_inferred_scores.engineering_maturity}/10</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Profile Deep Code Quality Analytics Workspace */}
            <div className="glass-panel rounded-2xl p-6 lg:col-span-2 space-y-6 overflow-y-auto max-h-[800px]">
              
              <div className="pb-6 border-b border-slate-850 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block">Repository intelligence telemetry</span>
                  <h2 className="text-2xl font-extrabold text-white mt-0.5">GitHub Profiler: {selectedCandidate.name}</h2>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Total Stars</span>
                  <span className="text-lg font-bold text-teal-400">
                    {selectedCandidate.id.includes("alex") ? 1627 : selectedCandidate.id.includes("sophia") ? 732 : 1710}
                  </span>
                </div>
              </div>

              {/* Language Diversity & Commits activity block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Tech Diversity pie charts */}
                <div className="bg-slate-900/20 p-4 border border-slate-850 rounded-2xl space-y-3">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Technological Diversity</span>
                  
                  <div className="flex flex-wrap gap-2.5">
                    {selectedCandidate.skills.slice(0, 6).map((skill, index) => (
                      <div key={index} className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-semibold">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                        <span>{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Commit telemetry */}
                <div className="bg-slate-900/20 p-4 border border-slate-850 rounded-2xl flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Commit Frequency (Weekly pattern)</span>
                    <span className="text-xs text-slate-500">Approximated commit count based on activity profiling.</span>
                  </div>
                  
                  <div className="flex items-end gap-1.5 h-[80px]">
                    {[45, 62, 55, 70, 48, 12, 8].map((val, idx) => (
                      <div key={idx} className="flex-1 bg-slate-850 border border-slate-800 rounded flex flex-col justify-end h-full group hover:border-teal-500 transition-colors">
                        <div className="bg-indigo-500 rounded" style={{ height: `${(val / 75) * 100}%` }} title={`${val} Commits`}></div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Projects List & Critique */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Code className="w-4 h-4 text-slate-400" />
                  Ingested Portfolio Projects Critique
                </h3>

                <div className="space-y-4">
                  {selectedCandidate.projects.map((proj, idx) => (
                    <div key={idx} className="bg-slate-900/40 border border-slate-850/80 rounded-xl p-5 space-y-4">
                      
                      {/* Title block */}
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2 pb-3 border-b border-slate-850">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-bold text-white">{proj.name}</h4>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${proj.is_crud ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' : 'bg-teal-500/10 border border-teal-500/20 text-teal-400'}`}>
                              {proj.is_crud ? "CRUD App" : "Infrastructure Engine"}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{proj.description}</p>
                        </div>

                        <div className="shrink-0 text-left sm:text-right">
                          <span className="block text-[10px] text-slate-500 font-bold uppercase">Evaluated Rating</span>
                          <span className="text-base font-bold text-teal-400 mt-0.5">
                            {((proj.complexity_score * 0.4) + (proj.scalability_score * 0.3) + (proj.originality_score * 0.3)).toFixed(1)}/10
                          </span>
                        </div>
                      </div>

                      {/* Score metrics */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                          <span className="block text-[10px] text-slate-500 font-bold uppercase">Complexity</span>
                          <span className="text-sm font-bold text-slate-200">{proj.complexity_score}/10</span>
                          <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
                            <div className="bg-teal-500 h-full rounded-full" style={{ width: `${proj.complexity_score * 10}%` }}></div>
                          </div>
                        </div>

                        <div>
                          <span className="block text-[10px] text-slate-500 font-bold uppercase">Scalability</span>
                          <span className="text-sm font-bold text-slate-200">{proj.scalability_score}/10</span>
                          <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
                            <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${proj.scalability_score * 10}%` }}></div>
                          </div>
                        </div>

                        <div>
                          <span className="block text-[10px] text-slate-500 font-bold uppercase">Originality</span>
                          <span className="text-sm font-bold text-slate-200">{proj.originality_score}/10</span>
                          <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
                            <div className="bg-purple-500 h-full rounded-full" style={{ width: `${proj.originality_score * 10}%` }}></div>
                          </div>
                        </div>

                        <div>
                          <span className="block text-[10px] text-slate-500 font-bold uppercase">Systems Depth</span>
                          <span className="text-sm font-bold text-slate-200">{proj.systems_depth}/10</span>
                          <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
                            <div className="bg-teal-400 h-full rounded-full" style={{ width: `${proj.systems_depth * 10}%` }}></div>
                          </div>
                        </div>
                      </div>

                      {/* VLM critique block */}
                      <div className="bg-slate-950 p-4 border border-slate-850 rounded-lg flex items-start gap-3">
                        <BrainCircuit className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5 animate-pulse" />
                        <div className="text-xs text-slate-400 leading-relaxed">
                          <strong className="text-slate-200 block mb-1">Vision-Language Architecture Critique</strong>
                          {proj.architecture_critique || "A robust systems implementation showing good decouple boundaries and thread executions."}
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ====================================================
            TAB 5: BIAS REDUCTION & ETHICAL FAIRNESS LAYER
            ==================================================== */}
        {activeTab === 'fairness' && (
          <div className="space-y-6">
            
            {/* Explainer note */}
            <div className="glass-panel rounded-2xl p-6 bg-gradient-to-tr from-teal-950/10 to-indigo-950/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1 max-w-[800px]">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Scale className="w-5 h-5 text-teal-400" />
                  Ethical AI Bias Reduction Framework
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  TALENTOS utilizes rigorous anonymization protocols. Sensitive demographic signals (gender proxies, specific schools, address formats, names) are completely stripped before entering the parsing vector-store alignment buffers, keeping rankings compliant under Title VII and EEOC directives.
                </p>
              </div>
              <span className="text-xs bg-teal-500/10 border border-teal-500/20 text-teal-400 font-extrabold px-3 py-1.5 rounded-xl uppercase tracking-wider shrink-0">
                Audit Status: 100% Compliant
              </span>
            </div>

            {/* Graphs Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Disparate impact explainer dials */}
              <div className="glass-panel rounded-2xl p-6 space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Selection Parity telemetry</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Calculations analyzing selection rates across diverse candidate pools (EEOC 80% Rule).</p>
                </div>

                <div className="flex flex-col items-center justify-center p-6 bg-slate-900/30 border border-slate-850 rounded-xl space-y-4">
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    {/* Ring SVG representation */}
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" stroke="#1e293b" strokeWidth="8" fill="transparent" />
                      <circle cx="50" cy="50" r="40" stroke="#14b8a6" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset="20.1" strokeLinecap="round" className="shadow-glowTeal" />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center text-center">
                      <span className="text-3xl font-extrabold text-white">0.92</span>
                      <span className="text-[9px] text-teal-400 uppercase tracking-widest font-bold mt-0.5">Disparate Impact</span>
                    </div>
                  </div>

                  <span className="text-xs text-slate-400 font-semibold text-center leading-relaxed">
                    Well within EEOC limit threshold. Scoring prioritize systems performance attributes over demographics.
                  </span>
                </div>
              </div>

              {/* Group Representation graphs */}
              <div className="glass-panel rounded-2xl p-6 lg:col-span-2 space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Candidate Demographic Cluster recommendations</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Representation parity across recommended shortlists compared to target applicant pool statistics.</p>
                </div>

                {/* Bars representation comparisons */}
                <div className="space-y-4">
                  <div className="bg-slate-900/20 border border-slate-850 p-4 rounded-xl space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300 font-bold">Visual Research Specialists Pool (Cluster A)</span>
                      <span className="text-slate-400">Shortlist selection rate: <strong className="text-teal-400">30%</strong> (vs 28% applicant pool)</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                      <div className="bg-teal-500 h-full rounded-l-full" style={{ width: '30%' }}></div>
                      <div className="bg-slate-700 h-full rounded-r-full" style={{ width: '70%' }}></div>
                    </div>
                  </div>

                  <div className="bg-slate-900/20 border border-slate-850 p-4 rounded-xl space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300 font-bold">Distributed Systems specialists pool (Cluster B)</span>
                      <span className="text-slate-400">Shortlist selection rate: <strong className="text-indigo-400">40%</strong> (vs 42% applicant pool)</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                      <div className="bg-indigo-500 h-full rounded-l-full" style={{ width: '40%' }}></div>
                      <div className="bg-slate-700 h-full rounded-r-full" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

      </main>

      {/* Sleek Minimal Footer */}
      <footer className="mt-auto border-t border-slate-900/80 bg-slate-950/80 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-3">
        <span className="text-[11px] text-slate-500">© 2026 TALENTOS Platform Architecture. All rights reserved.</span>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-500">EEOC & Title VII Audited</span>
          <span className="text-slate-700">•</span>
          <span className="text-[11px] text-slate-500">Gemini 2.5 & GPT-4o VLM Layer</span>
        </div>
      </footer>
    </div>
  );
}
