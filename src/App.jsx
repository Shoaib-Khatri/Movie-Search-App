import { useEffect, useRef, useState } from "react"
import Search from "./components/search"
import Loader from "./components/Loader"
import MovieCard from "./components/MovieCard"

function App() {

  let [query, setQuery] = useState("")
  let [errorMsg, setErrorMsg] = useState("")
  let [movies, setMovies] = useState([])
  let [isLoading, setIsLoading] = useState(false)
  let [page, setPage] = useState(1)
  let queryRef = useRef("")

  let API_BASE_URL = `https://api.themoviedb.org/3`;
  let API_KEY = import.meta.env.VITE_TMDB_API_KEY;

  let API_OPTIONS = {
    method: `GET`,
    headers: {
      accept: `application/json`,
      Authorization: `Bearer ${API_KEY}`
    }
  }

  let getMovies = async () => {

    if (page === 0) return;
    setIsLoading(true);
    setErrorMsg('')

    try {
      let searchTerm = queryRef.current
      let endpoint = searchTerm
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(searchTerm)}&page=${page}&include_adult=false`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc&page=${page}&include_adult=false`;

      let response = await fetch(endpoint, API_OPTIONS)

      if (!response.ok) {
        throw new Error(`Failed to fetch movies`)
      }

      let data = await response.json();

      if (data.response === `False`) {
        setErrorMsg(data.error || `Failed to fetch movies`)
        setMovies([])
        return;
      }

      setMovies(prev => [...prev, ...data.results || []])
      console.log(data.results);


    } catch (error) {
      console.log(`Error fetching movie data ${error}`);
      setErrorMsg(`Error fetching movie. Please try again later!`)
    } finally {
      setIsLoading(false)
    }
  }

  let handleInfiniteScroll = async () => {
    try {
      if (!isLoading && window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
        setPage(prev => prev + 1)
      }
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    window.addEventListener('scroll', handleInfiniteScroll)
    return () => {
      window.removeEventListener('scroll', handleInfiniteScroll)
    }
  }, [])

  useEffect(() => {
    getMovies();
  }, [page])

  useEffect(() => {
    let timeout = setTimeout(() => {
      queryRef.current = query
      setMovies([])
      setPage(1)
    }, 400);
    return () => {
      clearTimeout(timeout)
    }
  }, [query])

  return (
    <main>
      <div className="pattern" />
      <div className="wrapper">
        <header>
          <img src="./hero.png" alt="" />
          <h1>Find <span className="text-gradient">Movies</span> to Enjoy</h1>
        </header>
        <Search query={query} setQuery={setQuery} />
        <section className="all-movies">
          <h2 className="mt-10">Movies</h2>

          {errorMsg && <p className="text-red-500 text-center">{errorMsg}</p>}

          <ul>
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </ul>

          {isLoading && <Loader />}
        </section>
      </div>
    </main>
  )
}

export default App
