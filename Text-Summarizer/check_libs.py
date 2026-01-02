try:
    import pandas
    print("pandas installed")
except ImportError:
    print("pandas missing")

try:
    import sklearn
    print("sklearn installed")
except ImportError:
    print("sklearn missing")

try:
    import sentence_transformers
    print("sentence_transformers installed")
except ImportError:
    print("sentence_transformers missing")
