import { PopularMovie } from '@/types/tmdb';

// Curated dataset of popular movies for client-side fuzzy search
// This provides instant results for common searches
export const POPULAR_MOVIES_DATASET: PopularMovie[] = [
  // Bollywood Blockbusters
  { id: 19404, title: "Dilwale Dulhania Le Jayenge", slug: "dilwale-dulhania-le-jayenge-19404", posterPath: "/lfRkUr7DYdHldAqi3PwdQGBRBPM.jpg", releaseDate: "1995-10-20", rating: 8.7 },
  { id: 447404, title: "Dangal", slug: "dangal-447404", posterPath: "/lkOZcsXcOLZYeJ2YxJd3vSldvU4.jpg", releaseDate: "2016-12-23", rating: 8.4 },
  { id: 353081, title: "Mission: Impossible - Fallout", slug: "mission-impossible-fallout-353081", posterPath: "/AkJQpZp9WoNdj7pLYSj1L0RcMMN.jpg", releaseDate: "2018-07-13", rating: 7.4 },
  { id: 19995, title: "Avatar", slug: "avatar-19995", posterPath: "/jRXYjXNq0Cs2TcJjLkki24MLp7u.jpg", releaseDate: "2009-12-18", rating: 7.6 },
  { id: 299536, title: "Avengers: Infinity War", slug: "avengers-infinity-war-299536", posterPath: "/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg", releaseDate: "2018-04-25", rating: 8.3 },
  
  // Hollywood Classics & Recent Hits
  { id: 278, title: "The Shawshank Redemption", slug: "the-shawshank-redemption-278", posterPath: "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg", releaseDate: "1994-09-23", rating: 9.3 },
  { id: 238, title: "The Godfather", slug: "the-godfather-238", posterPath: "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg", releaseDate: "1972-03-14", rating: 9.2 },
  { id: 424, title: "Schindler's List", slug: "schindlers-list-424", posterPath: "/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg", releaseDate: "1993-12-15", rating: 9.0 },
  { id: 550, title: "Fight Club", slug: "fight-club-550", posterPath: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg", releaseDate: "1999-10-15", rating: 8.8 },
  { id: 155, title: "The Dark Knight", slug: "the-dark-knight-155", posterPath: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg", releaseDate: "2008-07-18", rating: 9.0 },
  
  // Marvel Cinematic Universe
  { id: 299534, title: "Avengers: Endgame", slug: "avengers-endgame-299534", posterPath: "/or06FN3Dka5tukK1e9sl16pB3iy.jpg", releaseDate: "2019-04-24", rating: 8.4 },
  { id: 1726, title: "Iron Man", slug: "iron-man-1726", posterPath: "/78lPtwv72eTNqFW9COBYI0dWDJa.jpg", releaseDate: "2008-05-02", rating: 7.9 },
  { id: 284054, title: "Black Panther", slug: "black-panther-284054", posterPath: "/uxzzxijgPIY7slzFvMotPv8wjKA.jpg", releaseDate: "2018-02-16", rating: 7.3 },
  { id: 315635, title: "Spider-Man: Homecoming", slug: "spider-man-homecoming-315635", posterPath: "/c24sv2weTHPsmDa7jEMN0m2P3RT.jpg", releaseDate: "2017-07-07", rating: 7.4 },
  { id: 363088, title: "Ant-Man and the Wasp", slug: "ant-man-and-the-wasp-363088", posterPath: "/rv1AWImgx386ULjcf1nnUN88fVO.jpg", releaseDate: "2018-07-04", rating: 7.0 },
  
  // Popular Franchises
  { id: 11, title: "Star Wars", slug: "star-wars-11", posterPath: "/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg", releaseDate: "1977-05-25", rating: 8.6 },
  { id: 120, title: "The Lord of the Rings: The Fellowship of the Ring", slug: "the-lord-of-the-rings-the-fellowship-of-the-ring-120", posterPath: "/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg", releaseDate: "2001-12-19", rating: 8.8 },
  { id: 122, title: "The Lord of the Rings: The Return of the King", slug: "the-lord-of-the-rings-the-return-of-the-king-122", posterPath: "/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg", releaseDate: "2003-12-17", rating: 9.0 },
  { id: 671, title: "Harry Potter and the Philosopher's Stone", slug: "harry-potter-and-the-philosophers-stone-671", posterPath: "/wuMc08IPKEatf9rnMNXvIDxqP4W.jpg", releaseDate: "2001-11-16", rating: 7.6 },
  { id: 672, title: "Harry Potter and the Chamber of Secrets", slug: "harry-potter-and-the-chamber-of-secrets-672", posterPath: "/sdEOH0992YZ0QSxgXNIGLq1ToUi.jpg", releaseDate: "2002-11-15", rating: 7.4 },
  
  // Action & Thriller
  { id: 13, title: "Forrest Gump", slug: "forrest-gump-13", posterPath: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg", releaseDate: "1994-07-06", rating: 8.8 },
  { id: 680, title: "Pulp Fiction", slug: "pulp-fiction-680", posterPath: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg", releaseDate: "1994-10-14", rating: 8.9 },
  { id: 629, title: "The Usual Suspects", slug: "the-usual-suspects-629", posterPath: "/jgJydPyZg7pWeGiVZqWPwHBmKnh.jpg", releaseDate: "1995-08-16", rating: 8.5 },
  { id: 539, title: "Psycho", slug: "psycho-539", posterPath: "/yz4QVqPx3h1hD1DfqqQkCq3rmxW.jpg", releaseDate: "1960-06-16", rating: 8.5 },
  { id: 637, title: "Life Is Beautiful", slug: "life-is-beautiful-637", posterPath: "/mfnkSeeVOBVheuNuNMNbeKTtmX8.jpg", releaseDate: "1997-12-20", rating: 8.6 },
  
  // Animated Movies
  { id: 862, title: "Toy Story", slug: "toy-story-862", posterPath: "/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg", releaseDate: "1995-11-22", rating: 8.3 },
  { id: 12, title: "Finding Nemo", slug: "finding-nemo-12", posterPath: "/eHuGQ10FUzK1mdOY69wF5pGgEf5.jpg", releaseDate: "2003-05-30", rating: 8.2 },
  { id: 585, title: "Monsters, Inc.", slug: "monsters-inc-585", posterPath: "/sgheSKxZkttIe8ONsf2sWXPgip3.jpg", releaseDate: "2001-11-01", rating: 8.1 },
  { id: 15602, title: "Up", slug: "up-15602", posterPath: "/eKi8dIrr8voobbaGzDpe8w0PVbC.jpg", releaseDate: "2009-05-29", rating: 8.3 },
  { id: 14836, title: "Coraline", slug: "coraline-14836", posterPath: "/4jeFXQYytChdZYE9JYO7Un87IlW.jpg", releaseDate: "2009-02-05", rating: 7.7 },
  
  // Sci-Fi & Fantasy
  { id: 603, title: "The Matrix", slug: "the-matrix-603", posterPath: "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg", releaseDate: "1999-03-31", rating: 8.7 },
  { id: 27205, title: "Inception", slug: "inception-27205", posterPath: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg", releaseDate: "2010-07-16", rating: 8.8 },
  { id: 157336, title: "Interstellar", slug: "interstellar-157336", posterPath: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", releaseDate: "2014-11-07", rating: 8.6 },
  { id: 62, title: "2001: A Space Odyssey", slug: "2001-a-space-odyssey-62", posterPath: "/ve72VxNqjGM69Uky4WTo2bK6rfq.jpg", releaseDate: "1968-04-02", rating: 8.3 },
  { id: 78, title: "Blade Runner", slug: "blade-runner-78", posterPath: "/63N9uy8nd9j7Eog2axPQ8lbr3Wj.jpg", releaseDate: "1982-06-25", rating: 8.1 },
  
  // Horror & Thriller
  { id: 694, title: "The Shining", slug: "the-shining-694", posterPath: "/b6ko0IKC8MdYBBPkkA1aBPLe2yz.jpg", releaseDate: "1980-05-23", rating: 8.4 },
  { id: 348, title: "Alien", slug: "alien-348", posterPath: "/vfrQk5IPloGg1v9Rzbh2Eg3VGyM.jpg", releaseDate: "1979-05-25", rating: 8.5 },
  { id: 807, title: "Se7en", slug: "se7en-807", posterPath: "/6yoghtyTpznpBik8EngEmJskVUO.jpg", releaseDate: "1995-09-22", rating: 8.6 },
  { id: 346, title: "Seven Samurai", slug: "seven-samurai-346", posterPath: "/8OKmBV5BUFzmozIC3pPWKHy17kx.jpg", releaseDate: "1954-04-26", rating: 9.0 },
  { id: 11216, title: "Cinema Paradiso", slug: "cinema-paradiso-11216", posterPath: "/8SRUfRUi6x4O68n0VCbDNRa6iGL.jpg", releaseDate: "1988-11-17", rating: 8.5 },
  
  // Recent Popular Movies
  { id: 508442, title: "Soul", slug: "soul-508442", posterPath: "/hm58Jw4Lw8OIeECIq5qyPYhAeRJ.jpg", releaseDate: "2020-12-25", rating: 8.0 },
  { id: 337401, title: "Mulan", slug: "mulan-337401", posterPath: "/aKx1ARwG55zZ0GpRvU2WrGrCG9o.jpg", releaseDate: "2020-09-04", rating: 5.7 },
  { id: 651571, title: "Breach", slug: "breach-651571", posterPath: "/13B6onhL6FzSN2KaNeQeMML05pS.jpg", releaseDate: "2020-12-17", rating: 2.5 },
  { id: 460465, title: "Mortal Kombat", slug: "mortal-kombat-460465", posterPath: "/nkayOAUBUu4mMvyNf9iHSUiPjF1.jpg", releaseDate: "2021-04-23", rating: 6.0 },
  { id: 399566, title: "Godzilla vs. Kong", slug: "godzilla-vs-kong-399566", posterPath: "/pgqgaUx1cJb5oZQQ5v0tNARCeBp.jpg", releaseDate: "2021-03-24", rating: 6.3 },
  
  // Comedy
  { id: 914, title: "The Great Dictator", slug: "the-great-dictator-914", posterPath: "/1QpO9wo7JWecZ4NiBuu625FiY1j.jpg", releaseDate: "1940-10-15", rating: 8.4 },
  { id: 105, title: "Back to the Future", slug: "back-to-the-future-105", posterPath: "/fNOH9f1aA7XRTzl1sAOx9iF553Q.jpg", releaseDate: "1985-07-03", rating: 8.5 },
  { id: 510, title: "One Flew Over the Cuckoo's Nest", slug: "one-flew-over-the-cuckoos-nest-510", posterPath: "/3jcbDmRFSz5O5Ld6mFVeZreZnEt.jpg", releaseDate: "1975-11-19", rating: 8.7 },
  { id: 769, title: "GoodFellas", slug: "goodfellas-769", posterPath: "/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg", releaseDate: "1990-09-21", rating: 8.7 },
  { id: 329, title: "Jurassic Park", slug: "jurassic-park-329", posterPath: "/b1AQYrI4Kxz8ITvhOcXjIMfp4p6.jpg", releaseDate: "1993-06-11", rating: 8.2 },
];

// Helper function to search within the popular movies dataset
export function searchPopularMovies(query: string): PopularMovie[] {
  if (!query || query.length < 2) return [];
  
  const searchTerm = query.toLowerCase();
  
  return POPULAR_MOVIES_DATASET.filter(movie => 
    movie.title.toLowerCase().includes(searchTerm) ||
    movie.title.toLowerCase().replace(/[^a-z0-9]/g, '').includes(searchTerm.replace(/[^a-z0-9]/g, ''))
  );
}