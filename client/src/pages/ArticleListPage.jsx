import { useMemo } from "react";
import { Link } from "react-router-dom";
import useFetch from "../hooks/useFetch.jsx";
import { getArticles } from "../services/articleService";
import { categoryLabel } from "../utils/productFormat";
import { ArrowLeftIcon } from "../components/ui/Icons";
import "./Pages.css";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function StoryCard({ article }) {
  return (
    <Link to={`/articles/${article._id}`} className="ac-story-card ac-glass-frost">
      <div className="ac-story-card__img">
        {article.image && <img src={`/images/articles/${article.image}`} alt="" loading="lazy" />}
      </div>
      <div className="ac-story-card__body">
        <div className="ac-story-meta">
          <span className="ac-story-meta__cat">{categoryLabel(article.category)}</span>
        </div>
        <h2 className="ac-story-card__title">{article.title}</h2>
        {article.excerpt && <p className="ac-story-card__excerpt">{article.excerpt}</p>}
        <span className="ac-story-card__by">by {article.author}</span>
      </div>
    </Link>
  );
}

function ArticleListPage() {
  const { data: raw, loading, error } = useFetch(getArticles);
  const articles = useMemo(() => raw ? shuffle(raw) : [], [raw]);

  if (loading) return <p className="loading">Loading stories...</p>;
  if (error) return <p className="loading">Could not load articles.</p>;

  const withImage = articles.filter((a) => a.image);
  const lead = withImage[0];
  const side = withImage.slice(1, 3);
  const rest = articles.filter((a) => a !== lead && !side.includes(a));

  return (
    <div className="articles-page ac-page ac-page-backdrop">
      <div className="ac-container">
        <Link to="/" className="ac-backlink"><ArrowLeftIcon /> Home</Link>

        <div className="ac-section-head" style={{ marginTop: "0.75rem" }}>
          <div>
            <p className="ac-eyebrow">From the mat</p>
            <h1 className="ac-h2">Stories</h1>
          </div>
          <span className="ac-toolbar__count">{articles.length} articles</span>
        </div>

        {lead && (
          <div className="ac-stories">
            <Link to={`/articles/${lead._id}`} className="ac-story-lead">
              <img src={`/images/articles/${lead.image}`} alt="" />
              <div className="ac-story-lead__panel ac-glass-smoke">
                <div className="ac-story-meta">
                  <span className="ac-story-meta__cat">{categoryLabel(lead.category)}</span>
                  <span className="ac-story-meta__by">by {lead.author}</span>
                </div>
                <h2 className="ac-story-lead__title">{lead.title}</h2>
                {lead.excerpt && <p className="ac-story-lead__excerpt">{lead.excerpt}</p>}
              </div>
            </Link>
            <div className="ac-stories__side">
              {side.map((article) => <StoryCard key={article._id} article={article} />)}
            </div>
          </div>
        )}

        {rest.length > 0 && (
          <div className="ac-stories-grid">
            {rest.map((article) => <StoryCard key={article._id} article={article} />)}
          </div>
        )}
      </div>
    </div>
  );
}

export default ArticleListPage;
