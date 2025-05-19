import requests
import re

TMDB_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyNWFjY2ZiMDU4ZTNlZmM1MzgxNDhiNzI5ZWMzZmNjOSIsIm5iZiI6MTc0NTMzMzg5OS4zNDQsInN1YiI6IjY4MDdhZThiMjc2YmY2NGU0MWFiMGI5YyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.R8d404zluovdYR2e8679owl0E0XUdH-6Hdq7-p_Adjs'
TMDB_BASE_URL = 'https://api.themoviedb.org/3'

HEADERS = {
    'Authorization': f'Bearer {TMDB_ACCESS_TOKEN}',
    'Content-Type': 'application/json;charset=utf-8'
}

def search_movie(title):
    """
    Searches for a movie by title on TMDB and returns the first result.
    """
    print("Raw TMDB search title:", title)

    # Basic sanitization: remove anything in parentheses
    title = re.sub(r"\s*\([^)]*\)", "", title).strip()

    print("Cleaned TMDB search title:", title)

    params = {
        'query': title,
        'include_adult': False,
        'language': 'en-US',
        'page': 1
    }
    url = f"{TMDB_BASE_URL}/search/movie"
    response = requests.get(url, headers=HEADERS, params=params)

    if response.status_code != 200:
        print("TMDB error:", response.status_code, response.text)
        return None

    results = response.json().get('results')
    if not results:
        return None
    return results[0]  # Return the first result


def get_movie_details(movie_id):
    """
    Fetches detailed movie information from TMDB, including the IMDb ID.
    """
    url = f"{TMDB_BASE_URL}/movie/{movie_id}"
    response = requests.get(url, headers=HEADERS)

    if response.status_code != 200:
        print("Failed to get movie details:", response.status_code, response.text)
        return None

    movie_details = response.json()
    return movie_details

def get_imdb_link_from_movie_id(movie_id):
    """
    Fetches IMDb link using movie_id from TMDB.
    """
    movie_details = get_movie_details(movie_id)
    if not movie_details:
        return None

    imdb_id = movie_details.get('imdb_id')
    if imdb_id:
        imdb_link = f"https://www.imdb.com/title/{imdb_id}/"
        return imdb_link
    return None