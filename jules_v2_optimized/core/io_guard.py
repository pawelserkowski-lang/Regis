import aiofiles
import json
import os

class IOGuard:
    @staticmethod
    async def read_json(filepath="status.json"):
        if not os.path.exists(filepath):
            return {}
        async with aiofiles.open(filepath, mode='r') as f:
            content = await f.read()
            return json.loads(content) if content else {}

    @staticmethod
    async def write_json(data, filepath="status.json"):
        async with aiofiles.open(filepath, mode='w') as f:
            await f.write(json.dumps(data, indent=2))