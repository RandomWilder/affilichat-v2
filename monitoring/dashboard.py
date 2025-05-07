# monitoring/dashboard.py
from dataclasses import dataclass
from typing import Dict, List
import json

@dataclass
class SystemHealth:
    cpu_usage: float
    memory_usage: float
    request_latency: Dict[str, float]
    error_rates: Dict[str, float]
    
    def to_json(self) -> str:
        return json.dumps(self.__dict__)