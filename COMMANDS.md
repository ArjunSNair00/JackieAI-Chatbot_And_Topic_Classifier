delete venv

```
rmdir venv -Recurse -Force
```

install python

```
python -m venv venv --without-pip
```

install pip

```
.\venv\Scripts\python -m ensurepip --upgrade
```

activate venv

```
.\venv\Scripts\Activate.ps1
```

install a library

```
.\venv\Scripts\python -m pip install <package>
```

show installed libraries

```
.\venv\Scripts\python -m pip list
```

run program

```
.\venv\Scripts\python script.py
```

Build

```
.\venv\Scripts\pyinstaller --onefile --noconsole --add-data "topic_classifier.pkl;." --collect-all fastapi --collect-all uvicorn --collect-all starlette --collect-all pydantic app.py
```

.\venv\Scripts\pyinstaller --onefile --add-data "topic_classifier.pkl;." --collect-all fastapi --collect-all uvicorn --collect-all sklearn --hidden-import sklearn.utils.\_cython_blas --hidden-import sklearn.neighbors.typedefs --hidden-import sklearn.neighbors.quad_tree --hidden-import sklearn.tree.\_utils app.py

.\venv\Scripts\pyinstaller --onefile --noconsole --add-data "topic_classifier.pkl;." --collect-all fastapi --collect-all uvicorn --collect-all sklearn app.py
