import { APIGatewayProxyEvent } from "aws-lambda/trigger/api-gateway-proxy";

export const eventJSON: APIGatewayProxyEvent = {
    "version": "2.0",
    "routeKey": "$default",
    "rawPath": "/dev/{tenantId}",
    "headers": {
        "Authorization": "Bearer test"
    },
    "requestContext": {
        "http": {
            "method": "DELETE",
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