import os
from typing import Dict, Any, List
from io import BytesIO
from loguru import logger
import uuid

try:
    from reportlab.lib.pagesizes import letter
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors
    from reportlab.lib.units import inch
    HAS_REPORTLAB = True
except ImportError:
    HAS_REPORTLAB = False
    logger.warning("reportlab not installed. PDF reporting will mock outputs.")


class ReportGenerationService:
    """
    Enterprise PDF Reporting Service.
    Generates downloadable risk assessment reports containing executive summaries,
    claim breakdowns, and jurisdiction heatmaps.
    """
    
    def __init__(self, output_dir: str = "data/reports"):
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)
        
        if HAS_REPORTLAB:
            self.styles = getSampleStyleSheet()
            # Custom Enterprise Styles
            self.styles.add(ParagraphStyle(
                name='CustomTitle', 
                parent=self.styles['Heading1'],
                fontSize=24,
                textColor=colors.HexColor('#0B0F19'),
                spaceAfter=20
            ))
            self.styles.add(ParagraphStyle(
                name='CustomSubtitle', 
                parent=self.styles['Heading2'],
                fontSize=14,
                textColor=colors.HexColor('#0ea5e9'), # Brand Electric Blue
                spaceAfter=15
            ))
            self.styles.add(ParagraphStyle(
                name='DangerText', 
                parent=self.styles['Normal'],
                textColor=colors.red,
                fontName='Helvetica-Bold'
            ))

    def generate_risk_report(self, analysis_id: str, data: Dict[str, Any]) -> str:
        """
        Builds the PDF report and saves it to disk.
        Returns the file path.
        """
        if not HAS_REPORTLAB:
            logger.error("Cannot generate true PDF without reportlab. Returning mock path.")
            return f"{self.output_dir}/mock_report_{analysis_id}.pdf"
            
        file_path = os.path.join(self.output_dir, f"PatentIQ_RiskReport_{analysis_id}.pdf")
        doc = SimpleDocTemplate(file_path, pagesize=letter, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=18)
        
        Story = []
        
        # 1. Header
        Story.append(Paragraph("PatentIQ Risk Intelligence Report", self.styles['CustomTitle']))
        Story.append(Paragraph(f"Analysis ID: {analysis_id}", self.styles['Normal']))
        Story.append(Paragraph(f"Generated on: {data.get('timestamp', 'N/A')}", self.styles['Normal']))
        Story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#1F2937"), spaceAfter=20, spaceBefore=10))
        
        # 2. Executive Summary
        Story.append(Paragraph("Executive Summary", self.styles['CustomSubtitle']))
        risk_level = data.get('risk_level', 'UNKNOWN')
        score = data.get('final_score', 0)
        
        risk_style = self.styles['DangerText'] if risk_level in ['HIGH', 'CRITICAL'] else self.styles['Normal']
        
        Story.append(Paragraph(f"Overall Infringement Risk Score: ", self.styles['Normal']))
        Story.append(Paragraph(f"{score}/100 ({risk_level})", risk_style))
        Story.append(Spacer(1, 0.2 * inch))
        
        summary_text = data.get('executive_summary', "The analysis indicates varying levels of semantic and structural overlap with existing prior art.")
        Story.append(Paragraph(summary_text, self.styles['Normal']))
        Story.append(Spacer(1, 0.3 * inch))

        # 3. Top Similar Patents Table
        Story.append(Paragraph("Identified Prior Art Threats", self.styles['CustomSubtitle']))
        
        table_data = [['Patent ID', 'Overlap Score', 'Jurisdiction', 'Status']]
        for patent in data.get('similar_patents', [])[:5]:
            table_data.append([
                patent.get('id', 'N/A'),
                f"{patent.get('score', 0):.1f}%",
                patent.get('jurisdiction', 'US'),
                patent.get('status', 'Active')
            ])
            
        if len(table_data) > 1:
            t = Table(table_data, colWidths=[2*inch, 1.5*inch, 1.5*inch, 1.5*inch])
            t.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0ea5e9')),
                ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
                ('ALIGN', (0,0), (-1,-1), 'CENTER'),
                ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
                ('FONTSIZE', (0,0), (-1,0), 12),
                ('BOTTOMPADDING', (0,0), (-1,0), 12),
                ('BACKGROUND', (0,1), (-1,-1), colors.HexColor('#f0f9ff')),
                ('GRID', (0,0), (-1,-1), 1, colors.HexColor('#1F2937'))
            ]))
            Story.append(t)
        else:
            Story.append(Paragraph("No significant overlapping patents found.", self.styles['Normal']))

        Story.append(Spacer(1, 0.4 * inch))
        
        # 4. Disclaimer
        Story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#1F2937"), spaceAfter=10, spaceBefore=20))
        disclaimer = "CONFIDENTIAL & PRIVILEGED. This report is generated by an automated AI system (PatentIQ) and does not constitute formal legal advice. Please consult a qualified patent attorney before making IP strategy decisions."
        Story.append(Paragraph(disclaimer, self.styles['Italic']))

        # Build PDF
        try:
            doc.build(Story)
            logger.info(f"Successfully generated PDF report at {file_path}")
            return file_path
        except Exception as e:
            logger.error(f"Failed to generate PDF: {e}")
            return ""

# Singleton
report_service = ReportGenerationService()
