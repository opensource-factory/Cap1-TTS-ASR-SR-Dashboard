import yaml
import json
from pathlib import Path




def return_config_data():
    config_path = Path(__file__).with_name("config.yaml")

    with config_path.open("r", encoding="utf-8") as f:
        config = yaml.safe_load(f)
        
    return config

def get_llm_providers():
    config = return_config_data()
    llm_models = []
    for item in config["llm"]["models"]:
        llm_models.append({"provider":item['provider'], "models":item['models']})
        
    return llm_models

def get_tts_providers():
    config = return_config_data()
    tts = []
    for item in config['tts']['models']:
        tts.append({'provider':item['provider'], 'models':item['models'], 
                    'voices': item['voice'], 'description': item['description']})
    return tts


