# Main API injection
$mainPy = Get-Content "w:\directory\haha\testing_project\main-api\main.py" -Raw

$imports = "from logger import setup_logger
from redis_client import get_redis
"
$mainPy = $mainPy -replace 'from fastapi import FastAPI, Depends, HTTPException', ($imports + 'from fastapi import FastAPI, Depends, HTTPException')

$loggerInit = "logger = setup_logger('main-api', 'logs/main_api.log')
"
$mainPy = $mainPy -replace 'app = FastAPI\(title="Main API", lifespan=lifespan\)', ($loggerInit + 'app = FastAPI(title="Main API", lifespan=lifespan)')

Set-Content "w:\directory\haha\testing_project\main-api\main.py" -Value $mainPy


# Academy API injection
$academyPy = Get-Content "w:\directory\haha\testing_project\academy-api\main.py" -Raw

$imports = "from logger import setup_logger
from redis_client import get_redis
"
$academyPy = $academyPy -replace 'from fastapi import FastAPI, Depends, HTTPException', ($imports + 'from fastapi import FastAPI, Depends, HTTPException')

$loggerInit = "logger = setup_logger('academy-api', 'logs/academy_api.log')
"
$academyPy = $academyPy -replace 'app = FastAPI\(title="Academy API", lifespan=lifespan\)', ($loggerInit + 'app = FastAPI(title="Academy API", lifespan=lifespan)')

Set-Content "w:\directory\haha\testing_project\academy-api\main.py" -Value $academyPy


# AI Engine injection
$aiEnginePy = Get-Content "w:\directory\haha\testing_project\ai-engine\main.py" -Raw

$imports = "from logger import setup_logger
"
$aiEnginePy = $aiEnginePy -replace 'from fastapi import FastAPI, HTTPException', ($imports + 'from fastapi import FastAPI, HTTPException')

$loggerInit = "logger = setup_logger('ai-engine', 'logs/ai_engine.log')
"
$aiEnginePy = $aiEnginePy -replace 'app = FastAPI\(title="AI Engine API"\)', ($loggerInit + 'app = FastAPI(title="AI Engine API")')

Set-Content "w:\directory\haha\testing_project\ai-engine\main.py" -Value $aiEnginePy


# AI Stream injection
$aiStreamPy = Get-Content "w:\directory\haha\testing_project\ai-stream\main.py" -Raw

$imports = "from logger import setup_logger
"
$aiStreamPy = $aiStreamPy -replace 'import logging
', ($imports)

$loggerInit = "logger = setup_logger('ai-stream', 'logs/ai_stream.log')
"
$aiStreamPy = $aiStreamPy -replace 'logger = logging.getLogger\(__name__\)', $loggerInit

Set-Content "w:\directory\haha\testing_project\ai-stream\main.py" -Value $aiStreamPy

Write-Host "Successfully integrated loggers and redis clients into FastAPIs!" -ForegroundColor Green
