import { useState, useEffect } from "react";
import Header from "./Header";
import { Outlet } from "react-router-dom";
import axios from "axios";

export default function Layout() {
  axios.defaults.baseURL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

  const [places, setPlaces] = useState([]);

  const fetchPlaces = async () => {
    const { data } = await axios.get("/api/places");
    setPlaces(data);
    console.log(data);
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  return (
    <div className="py-4 px-8 flex flex-col min-h-screen max-w-4xl mx-auto">
      <Header />

      {places.length > 0 && (
        <div className="flex flex-wrap -mx-4">
          {places.map((place) => (
            <div key={place.id} className="w-full md:w-1/2 lg:w-1/3 px-4 mb-8">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-4">
                  <img
                    src={place.img}
                    alt=""
                    className="w-full h-48 object-cover object-center"
                  />
                  <h2 className="text-xl font-semibold text-gray-800">
                    {place.title}
                  </h2>
                  <p className="text-gray-600">${place.price} / night</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Outlet />
    </div>
  );
}
