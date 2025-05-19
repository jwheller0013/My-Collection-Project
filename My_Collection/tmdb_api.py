import requests

TMDB_API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyNWFjY2ZiMDU4ZTNlZmM1MzgxNDhiNzI5ZWMzZmNjOSIsIm5iZiI6MTc0NTMzMzg5OS4zNDQsInN1YiI6IjY4MDdhZThiMjc2YmY2NGU0MWFiMGI5YyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.R8d404zluovdYR2e8679owl0E0XUdH-6Hdq7-p_Adjs'
TMDB_BASE_URL = 'https://api.themoviedb.org/3'

def search_movie(title):
    url = f"{TMDB_BASE_URL}/search/movie"
    params = {
        'api_key': TMDB_API_KEY,
        'query': title
    }
    response = requests.get(url, params=params)
    response.raise_for_status()
    results = response.json().get('results')
    return results[0] if results else None

def get_movie_details(movie_id):
    url = f"{TMDB_BASE_URL}/movie/{movie_id}"
    params = {
        'api_key': TMDB_API_KEY,
        'append_to_response': 'credits'
    }
    response = requests.get(url, params=params)
    response.raise_for_status()
    return response.json()
