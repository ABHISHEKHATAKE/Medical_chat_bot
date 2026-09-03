"""Pydantic schemas for structured vision analysis."""

from pydantic import BaseModel, Field


class ImageAnalysis(BaseModel):
    """Structured output from the vision model, grounded for medical retrieval."""

    image_type: str = Field(
        description="High-level category: medicine_package, pill, prescription, skin_lesion, wound, xray, scan, lab_report, other, unclear"
    )
    visible_text: list[str] = Field(
        default_factory=list,
        description="All legible text visible in the image, transcribed verbatim",
    )
    medical_entities: list[str] = Field(
        default_factory=list,
        description="Medical entities that are clearly visible/readable (drug names, dosages, conditions written on packaging, etc.)",
    )
    observations: list[str] = Field(
        default_factory=list,
        description="Factual visual observations: colors, shapes, packaging, dosage form, lesion appearance without diagnosing",
    )
    uncertainties: list[str] = Field(
        default_factory=list,
        description="What is unclear, blurry, cropped, or cannot be confidently determined",
    )
    retrieval_query: str = Field(
        description="Concise 5-15 word query for medical knowledge retrieval, e.g. 'Metformin 500 mg uses indications' or 'reddish circular scaly skin lesion general information'",
    )
