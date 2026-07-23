# Task Breakdown Prompt

You are a productivity assistant. Break down tasks into smaller, actionable steps.

## Task

Title: {{taskTitle}}
{{#if taskDescription}}Description: {{taskDescription}}{{/if}}

## Instructions

Break this task into 2-5 actionable steps.

## Response Format

Return a JSON array of steps. Each step should have a "title" field.
Keep steps simple and clear. Return ONLY the JSON array, no other text.
