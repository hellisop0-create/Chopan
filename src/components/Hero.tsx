import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin } from 'lucide-react';

export default function Hero() {
  const [query, setQuery] = React.useState("");
  const [city, setCity] = React.useState("All Pakistan");
  const navigate = useNavigate();

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Redirects to /search?q=iphone&location=Lahore
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (city !== "All Pakistan") params.append('location', city);

    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="bg-green-900 py-20">
      <form onSubmit={handleSearch} className="max-w-3xl mx-auto bg-white rounded-xl p-2 flex flex-col md:flex-row gap-2 shadow-2xl">
        <div className="flex-1 flex items-center px-4 border-r">
          <Search className="text-gray-400 mr-2" />
          <input 
            type="text" 
            placeholder="Find Cars, Mobile Phones and more..." 
            className="w-full p-4 outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center px-4 md:w-48">
          <MapPin className="text-gray-400 mr-2" />
          <select 
            className="bg-transparent outline-none w-full cursor-pointer"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          >
            <option>All Pakistan</option>
            <option>Lahore</option>
            <option>Karachi</option>
            <option>Islamabad</option>
          </select>
        </div>
        <button type="submit" className="bg-orange-500 text-white px-10 py-4 rounded-lg font-bold hover:bg-orange-600">
          Search
        </button>
      </form>
    </div>
  );
}