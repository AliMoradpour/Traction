# AI Monitoring

## Overview

This document describes the AI monitoring and observability system for Traction.

## Metrics Tracked

### Request Metrics
- Total requests
- Successful requests
- Failed requests
- Average response time
- Failure rate

### Token Metrics
- Total tokens used
- Tokens per feature
- Tokens per model

### Cache Metrics
- Cache hit rate
- Cache size
- Expired entries

## Features Monitored

| Feature | Rate Limit | Window |
|---------|-----------|--------|
| Daily Brief | 1/day | 24 hours |
| Weekly Review | 1/week | 7 days |
| Goal Recovery | 3/day | 24 hours |
| Task Breakdown | 20/day | 24 hours |
| Stuck Analysis | 10/day | 24 hours |
| Recommendations | 5/day | 24 hours |

## Failure Handling

When AI fails:
1. Check cache for recent result
2. Use fallback model
3. Return rules-based result
4. Graceful UI message

## Observability Endpoints

- `GET /ai/metrics` - Overall AI metrics
- `GET /ai/metrics/features` - Per-feature metrics
- `GET /ai/status` - AI provider status
- `GET /ai/usage` - User usage stats

## Alerts

- Failure rate > 50%: Warning
- Response time > 5s: Warning
- Cache hit rate < 20%: Info
- Token usage > 100k/day: Info
