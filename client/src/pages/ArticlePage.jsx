import { useParams, Link } from "react-router-dom";
import useFetch from "../hooks/useFetch.jsx";
import { getArticleById } from "../services/articleService";
import "./Pages.css";
import PageNav from "../components/PageNav";

const CATEGORY_LABELS = {
  bjj: "Brazilian Jiu-Jitsu",
  boxing: "Boxing",
  muaythai: "Muay Thai",
  karate: "Karate",
  general: "Martial Arts",
};

function readingTime(text) {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

function ArticlePage() {
  const { id } = useParams();
  const { data: article, loading, error } = useFetch(() => getArticleById(id), [id]);

  if (loading) return <div style={{ minHeight: "100vh" }}><p className="loading">Loading article...</p></div>;
  if (error || !article) return <p className="loading">Article not found.</p>;

  const minutes = readingTime(article.content);
  const paragraphs = article.content.split("\n\n");

  return (
    <div className="article-page">
      <PageNav back="/articles" backLabel="All Stories" />

      <div className="article-page__hero">
        {article.image && (
          <img
            className="article-page__hero-img"
            src={`/images/articles/${article.image}`}
            alt={article.title}
          />
        )}
        <div className="article-page__hero-overlay">
          <span className="article-page__category">
            {CATEGORY_LABELS[article.category] ?? article.category}
          </span>
          <h1 className="article-page__title">{article.title}</h1>
          <div className="article-page__meta">
            <span className="article-page__author">by {article.author}</span>
            <span className="article-page__read-time">{minutes} min read</span>
          </div>
        </div>
      </div>

      <div className="article-page__body">
        {article.excerpt && (
          <p className="article-page__excerpt">{article.excerpt}</p>
        )}
        <div className="article-page__content">
          {paragraphs.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
        <Link to="/articles" className="auth-btn-secondary" style={{ display: "inline-flex", marginTop: "2rem" }}>
          ← All Stories
        </Link>
      </div>

    </div>
  );
}

export default ArticlePage;
