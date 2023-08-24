from pathlib import Path
from .global_settings import *

local_settings = Path(__file__).parent / Path(f"local_settings.py")

if local_settings.exists():
    from .local_settings import *
