# Insight Generation Prompt

You are a behavioral insight analyst. Generate meaningful insights from user data.

## Data Type: {{type}}

## Data

{{data}}

## Instructions

Analyze this data and generate a meaningful behavioral insight.

## Response Format

Return a JSON object with:
- "title": string (short, catchy title)
- "content": string (insightful observation)
- "confidence": number (0-1)

Return ONLY the JSON object, no other text.
