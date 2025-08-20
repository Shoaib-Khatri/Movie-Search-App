import { useEffect, useRef, useState } from "react"
import Search from "./components/Search"
import Loader from "./components/Loader"
import MovieCard from "./components/MovieCard"

function App() {

  let [query, setQuery] = useState("")
  let [errorMsg, setErrorMsg] = useState("")
  let [movies, setMovies] = useState([])
  let [isLoading, setIsLoading] = useState(false)
  let [page, setPage] = useState(1)
  let queryRef = useRef("")

  let API_BASE_URL = `https://api.themoviedb.org/3`
  let API_KEY = import.meta.env.VITE_TMDB_API_KEY

  let API_OPTIONS = {
    method: `GET`,
    headers: {
      accept: `application/json`,
      Authorization: `Bearer ${API_KEY}`
    }
  }

  /**
   * Fetch movies from TMDB API
   * - Handles both search & discover
   * - Stops fetching if no results
   */
  let getMovies = async (signal) => {
    if (page === 0) return // Stop fetching if page is 0

    setIsLoading(true)
    setErrorMsg("")

    try {
      let searchTerm = queryRef.current
      let endpoint = searchTerm
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(searchTerm)}&page=${page}&include_adult=false`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc&page=${page}&include_adult=false`

      let response = await fetch(endpoint, { ...API_OPTIONS, signal })

      if (!response.ok) {
        throw new Error(`Failed to fetch movies`)
      }

      let data = await response.json()

      if (!data.results || data.results.length === 0) {
        // No more results → stop infinite scroll
        if (page > 1) {
          setPage(0)
        } else {
          setErrorMsg("No movies found.")
          setMovies([])
        }
        return
      }

      // Append new movies
      setMovies(prev => [...prev, ...data.results])

    } catch (error) {
      if (error.name !== "AbortError") {
        console.log(`Error fetching movie data: ${error}`)
        setErrorMsg(`Error fetching movie. Please try again later!`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Infinite scroll handler
   * - Throttled to avoid too many calls
   */
  let scrollTimeout
  let handleInfiniteScroll = () => {
    if (scrollTimeout) return
    scrollTimeout = setTimeout(() => {
      if (!isLoading && window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
        setPage(prev => prev + 1)
      }
      scrollTimeout = null
    }, 300)
  }

  // Attach scroll listener
  useEffect(() => {
    window.addEventListener("scroll", handleInfiniteScroll)
    return () => {
      window.removeEventListener("scroll", handleInfiniteScroll)
    }
  }, [isLoading])

  // Fetch movies when page changes
  useEffect(() => {
    const controller = new AbortController()
    getMovies(controller.signal)
    return () => controller.abort() // cancel request if component unmounts
  }, [page])

  /**
   * Search effect
   * - Debounce search by 500ms
   * - Cancels previous API requests
   */
  useEffect(() => {
    const controller = new AbortController()
    let timeout = setTimeout(() => {
      queryRef.current = query
      setMovies([])
      setPage(1)
    }, 500)

    return () => {
      clearTimeout(timeout)
      controller.abort()
    }
  }, [query])

  return (
    <main>
      <div className="pattern" />
      <div className="wrapper">
        <header>
          <img src="./hero.png" alt="Hero" />
          <h1>Find <span className="text-gradient">Movies</span> to Enjoy</h1>
        </header>

        {/* Search bar */}
        <Search query={query} setQuery={setQuery} />

        {/* Movies Section */}
        <section className="all-movies">
          <h2 className="mt-10">Movies</h2>

          {/* Error message */}
          {errorMsg && <p className="text-red-500 text-center">{errorMsg}</p>}

          {/* Movie List */}
          <ul>
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </ul>

          {/* Loader */}
          {isLoading && <Loader />}
        </section>
      </div>
    </main>
  )
}

export default App
