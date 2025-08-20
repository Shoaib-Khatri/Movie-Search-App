import React from 'react'

function Search({query, setQuery}) {
  return (
    <div className='search'>
        <div>
            <img src="./search.svg" alt="search" />
            <input type="text" 
                   placeholder='Search your favorite Movies...'
                   value={query}
                   onChange={(e) => setQuery(e.target.value)}/>
        </div>
    </div>
  )
}

export default Search