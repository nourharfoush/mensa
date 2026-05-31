import os
path = r"f:\myprog\menasa\rowaq-app\levels\2.pdf"
print("Exists:", os.path.exists(path))
print("Workspace path exists:", os.path.exists("levels/2.pdf"))
print("Current dir:", os.getcwd())
print("Files in levels:", os.listdir("levels"))
