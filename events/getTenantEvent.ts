import { APIGatewayProxyEvent } from "aws-lambda/trigger/api-gateway-proxy";

export const eventJSON: APIGatewayProxyEvent = {
    "version": "2.0",
    "routeKey": "$default",
    "rawPath": "/dev/{tenantId}",
    "headers": {
        "Authorization": "eyJraWQiOiJIRWE1U2pMb0VwNDhqeUxURzUrd2htZjRFREVZaEJSMlVQbklxYk5UOUZNPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJkNzE4MGI3OC02NTQ0LTQ0ZWYtOTUxYi0wNGYwNzBhY2YzNTIiLCJjb2duaXRvOmdyb3VwcyI6WyJzdXBlci1hZG1pbiIsInRyYWR1dHRvcmUiLCJhZG1pbiJdLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuZXUtY2VudHJhbC0xLmFtYXpvbmF3cy5jb21cL2V1LWNlbnRyYWwtMV9PY3labFlaRWoiLCJjb2duaXRvOnVzZXJuYW1lIjoid2Vnb242NzU0OEBtZXZvcmkuY29tIiwiZ2l2ZW5fbmFtZSI6IkYiLCJvcmlnaW5fanRpIjoiYTA4ZDg5MzItMjM2Ny00NGJlLTkxOTYtYzExNzIyNzUwZGZhIiwiYXVkIjoiN2Q1aWo5b2wwMWwyNDA1cjJpNWQ0dmdkdm8iLCJldmVudF9pZCI6ImQ2OGE1ZTRiLTM0MmEtNGRiZi1iMzdkLWVlNDA4MGZhYzM2MyIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNjg0OTIzNTU0LCJleHAiOjE2ODQ5MjcxNTQsImlhdCI6MTY4NDkyMzU1NCwiZmFtaWx5X25hbWUiOiJGIiwianRpIjoiNjI1N2Y5YzItYWI5Ni00NGVhLThiZWQtMDg1YTkzYjgzNTQyIiwiZW1haWwiOiJ3ZWdvbjY3NTQ4QG1ldm9yaS5jb20ifQ.PluWFfUUYS6K3fo89pncLUHgfwS2kJGhfQXVUJRG27VUFVggBoNkWGDfQkXI1Ddo1mUk5J6CTDeX3r1t_EBlb_n8t1BdMYeJTa_lec7XjVaXg4DjO5Ev5J_3StyGuRByXuR1kVmOU1YsGqRS1OQmELQsvJFYgRfvLfhaufrQKcuaVsgtaOfKRgcBnAFGPnfuipitbbsXMJ-2PUnpbVArEBwln7duxVUyTCY1WBLHZd6qkqu4JKDZkyAVlY4YvXkfm8Fr3yEJ4JD2Ss05uDk0AiUWZToMJUwtNcXmpc3-IUNPJ_T2clMLy43FF5yh2a2JTISsuMNxPhrP0kwHclHFAA"
    },
    "requestContext": {
        "http": {
            "method": "GET",
            "path": "/dev/{tenantId}",
            "protocol": "HTTP/1.1",
            "sourceIp": "192.168.0.1/32",
            "userAgent": "agent"
        },
        "requestId": "id",
        "routeKey": "$default",
        "stage": "$default",
        "time": "12/Mar/2020:19:03:58 +0000",
        "timeEpoch": 1583348638390
    },
    "body": "",
    "pathParameters": {
        "tenantId": "tenant1"
    }
} as any