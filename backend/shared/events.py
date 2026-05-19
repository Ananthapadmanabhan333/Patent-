import json
from contextlib import asynccontextmanager
import redis.asyncio as redis
from loguru import logger

from backend.shared.config import settings

redis_client = None

def get_redis_client():
    global redis_client
    if redis_client is None:
        redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
    return redis_client


async def publish_event(stream_name: str, event_type: str, payload: dict):
    """
    Publish an event to a Redis Stream to trigger async microservice logic.
    """
    client = get_redis_client()
    try:
        # Convert dict payload to string values for Redis Streams
        message = {
            "event_type": event_type,
            "payload": json.dumps(payload)
        }
        message_id = await client.xadd(stream_name, message)
        logger.info(f"Published event '{event_type}' to stream '{stream_name}' (ID: {message_id})")
        return message_id
    except Exception as e:
        logger.error(f"Failed to publish event to {stream_name}: {str(e)}")
        return None


@asynccontextmanager
async def event_bus_lifespan():
    """Manage Redis connection lifecycle"""
    yield
    global redis_client
    if redis_client:
        await redis_client.close()
