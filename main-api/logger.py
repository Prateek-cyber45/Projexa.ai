import logging
import json
import socket
from datetime import datetime
import os
import traceback

class JSONFormatter(logging.Formatter):
    def __init__(self, service_name: str):
        super().__init__()
        self.service_name = service_name
        self.hostname = socket.gethostname()

    def format(self, record):
        log_record = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "service": self.service_name,
            "host": self.hostname,
            "message": record.getMessage(),
            "module": record.module,
            "funcName": record.funcName,
            "lineNo": record.lineno
        }
        if record.exc_info:
            log_record["exc_info"] = self.formatException(record.exc_info)
        return json.dumps(log_record)

def setup_logger(service_name: str, log_file: str):
    os.makedirs(os.path.dirname(log_file), exist_ok=True)
    logger = logging.getLogger(service_name)
    logger.setLevel(logging.INFO)
    
    file_handler = logging.FileHandler(log_file)
    file_handler.setFormatter(JSONFormatter(service_name))
    
    stream_handler = logging.StreamHandler()
    stream_handler.setFormatter(JSONFormatter(service_name))
    
    if not logger.handlers:
        logger.addHandler(file_handler)
        logger.addHandler(stream_handler)
        
    return logger