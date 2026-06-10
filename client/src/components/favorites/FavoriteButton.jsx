import { useFavorites } from "../../context/FavoriteContext";

export function FavoriteButton({ product }) {
  const [toggleFavorites, favorites] = useFavorites();

  const active = favorites.some((fav) => fav._id === product._id);

  return (
    <button
      onClick={() => toggleFavorites(product)}
      aria-label={active ? "Remove from favorites" : "Add to favorites"}
    >
      <img
        src={active ? "/icons/FavoritesFilled.png" : "/icons/Favorites.png"}
        alt=""
      />
    </button>
  );
}
