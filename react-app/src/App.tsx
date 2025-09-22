import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  DEFAULT_STYLE,
  genderLabels,
  generateNames,
  getAvailableGenders,
  getAvailableStyles,
  getRaces,
} from './lib/names';
import type { Gender } from './types/names';
import './App.css';

type GeneratedName = {
  id: string;
  value: string;
  race: string;
  gender: Gender;
};

type Status = {
  message: string;
  tone: 'success' | 'error' | 'info';
};

const FAVORITES_KEY = 'fantasy-generator:favorites';
const HISTORY_LIMIT = 30;

const createId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const fallbackCopy = (text: string) => {
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', 'true');
  area.style.position = 'absolute';
  area.style.left = '-9999px';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  try {
    document.execCommand('copy');
  } finally {
    document.body.removeChild(area);
  }
};

function App() {
  const races = useMemo(() => getRaces(), []);
  const [selectedRace, setSelectedRace] = useState<string>(races[0] ?? 'humain');
  const [selectedGender, setSelectedGender] = useState<Gender>('masculin');
  const [selectedStyle, setSelectedStyle] = useState<string>(DEFAULT_STYLE);
  const [quantity, setQuantity] = useState<number>(5);
  const [suggestions, setSuggestions] = useState<GeneratedName[]>([]);
  const [history, setHistory] = useState<GeneratedName[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [status, setStatus] = useState<Status | null>(null);

  const availableGenders = useMemo(() => getAvailableGenders(selectedRace), [selectedRace]);
  const availableStyles = useMemo(
    () => getAvailableStyles(selectedRace, selectedGender),
    [selectedRace, selectedGender],
  );

  useEffect(() => {
    if (!races.length) {
      return;
    }

    if (!selectedRace || !races.includes(selectedRace)) {
      setSelectedRace(races[0]);
    }
  }, [races, selectedRace]);

  useEffect(() => {
    if (!availableGenders.includes(selectedGender)) {
      setSelectedGender(availableGenders[0] ?? 'masculin');
    }
  }, [availableGenders, selectedGender]);

  useEffect(() => {
    if (!availableStyles.length) {
      setSelectedStyle(DEFAULT_STYLE);
      return;
    }

    if (!availableStyles.includes(selectedStyle)) {
      setSelectedStyle(availableStyles[0]);
    }
  }, [availableStyles, selectedStyle]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const raw = window.localStorage.getItem(FAVORITES_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setFavorites(parsed.filter((item): item is string => typeof item === 'string'));
        }
      }
    } catch (error) {
      console.error('Impossible de charger les favoris', error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Impossible de sauvegarder les favoris', error);
    }
  }, [favorites]);

  useEffect(() => {
    if (!status) {
      return;
    }

    const timeout = window.setTimeout(() => setStatus(null), 3500);
    return () => window.clearTimeout(timeout);
  }, [status]);

  const handleGenerate = (event: FormEvent) => {
    event.preventDefault();
    if (!selectedRace || !availableGenders.length) {
      return;
    }

    const names = generateNames(selectedRace, selectedGender, quantity, selectedStyle);
    if (!names.length) {
      setStatus({
        message: "Aucune combinaison disponible pour ce filtre.",
        tone: 'error',
      });
      return;
    }

    const entries = names.map<GeneratedName>((value) => ({
      id: createId(),
      value,
      race: selectedRace,
      gender: selectedGender,
    }));

    setSuggestions(entries);
    setHistory((previous) => [...entries, ...previous].slice(0, HISTORY_LIMIT));
    setStatus({
      message: `${entries.length} suggestion${entries.length > 1 ? 's' : ''} générée${
        entries.length > 1 ? 's' : ''
      }.`,
      tone: 'info',
    });
  };

  const handleCopy = async (name: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(name);
      } else {
        fallbackCopy(name);
      }
      setStatus({ message: `« ${name} » copié dans le presse-papiers.`, tone: 'success' });
    } catch (error) {
      console.error('Erreur lors de la copie', error);
      try {
        fallbackCopy(name);
        setStatus({ message: `« ${name} » copié.`, tone: 'success' });
      } catch {
        setStatus({
          message: 'Impossible de copier ce nom automatiquement.',
          tone: 'error',
        });
      }
    }
  };

  const toggleFavorite = (name: string) => {
    setFavorites((previous) => {
      if (previous.includes(name)) {
        return previous.filter((item) => item !== name);
      }
      return [name, ...previous];
    });
  };

  const clearSuggestions = () => {
    setSuggestions([]);
  };

  const clearFavorites = () => {
    setFavorites([]);
    setStatus({ message: 'Favoris effacés.', tone: 'info' });
  };

  const isFavorite = (name: string) => favorites.includes(name);

  return (
    <div className="app">
      <header className="hero">
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          Générateur de noms fantastiques
        </motion.h1>
        <motion.p
          className="hero__subtitle"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: 'easeOut' }}
        >
          Compose des identités épiques à partir de nos bases de données JSON pour chaque peuple et
          chaque genre, y compris l’option non-binaire.
        </motion.p>
      </header>

      <main className="layout" aria-live="polite">
        <motion.section
          className="panel panel--controls"
          layout
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <form className="controls" onSubmit={handleGenerate}>
            <div className="field">
              <label htmlFor="race">Peuple</label>
              <select
                id="race"
                value={selectedRace}
                onChange={(event) => setSelectedRace(event.target.value)}
              >
                {races.map((race) => (
                  <option key={race} value={race}>
                    {race.charAt(0).toUpperCase() + race.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <fieldset className="field">
              <legend>Genre</legend>
              <div className="chips">
                {availableGenders.map((gender) => (
                  <motion.button
                    key={gender}
                    type="button"
                    className={`chip ${selectedGender === gender ? 'chip--active' : ''}`}
                    onClick={() => setSelectedGender(gender)}
                    whileTap={{ scale: 0.95 }}
                    aria-pressed={selectedGender === gender}
                  >
                    {genderLabels[gender]}
                  </motion.button>
                ))}
              </div>
            </fieldset>

            {availableStyles.length > 1 && (
              <div className="field">
                <label htmlFor="style">Style</label>
                <select
                  id="style"
                  value={selectedStyle}
                  onChange={(event) => setSelectedStyle(event.target.value)}
                >
                  {availableStyles.map((style) => (
                    <option key={style} value={style}>
                      {style.charAt(0).toUpperCase() + style.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="field field--range">
              <label htmlFor="quantity">Nombre de suggestions</label>
              <div className="range-wrapper">
                <input
                  id="quantity"
                  type="range"
                  min={1}
                  max={10}
                  value={quantity}
                  onChange={(event) => setQuantity(Number(event.target.value))}
                />
                <span className="range-value">{quantity}</span>
              </div>
            </div>

            <div className="actions">
              <motion.button whileTap={{ scale: 0.97 }} type="submit" className="primary">
                Générer
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="button"
                className="secondary"
                onClick={clearSuggestions}
                disabled={!suggestions.length}
              >
                Effacer
              </motion.button>
            </div>
          </form>
        </motion.section>

        <motion.section
          className="panel panel--suggestions"
          layout
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.45, ease: 'easeOut' }}
        >
          <header className="panel__header">
            <h2>Suggestions</h2>
            <p className="panel__hint">
              Astuce : clique sur l’étoile pour enregistrer un nom ou sur copier pour le partager.
            </p>
          </header>

          <AnimatePresence initial={false}>
            {suggestions.length ? (
              <motion.ul
                key="suggestions"
                className="list"
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {suggestions.map((item) => (
                  <motion.li
                    key={item.id}
                    className="list-item"
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                  >
                    <div className="list-item__info">
                      <span className="list-item__name">{item.value}</span>
                      <span className="list-item__meta">
                        {item.race} · {genderLabels[item.gender]}
                      </span>
                    </div>
                    <div className="list-item__actions">
                      <button type="button" onClick={() => handleCopy(item.value)}>
                        Copier
                      </button>
                      <button
                        type="button"
                        className={isFavorite(item.value) ? 'favorite active' : 'favorite'}
                        onClick={() => toggleFavorite(item.value)}
                        aria-pressed={isFavorite(item.value)}
                        aria-label={
                          isFavorite(item.value)
                            ? `Retirer ${item.value} des favoris`
                            : `Ajouter ${item.value} aux favoris`
                        }
                      >
                        ★
                      </button>
                    </div>
                  </motion.li>
                ))}
              </motion.ul>
            ) : (
              <motion.p
                key="empty"
                className="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Lance une génération pour obtenir des propositions.
              </motion.p>
            )}
          </AnimatePresence>

          <section className="subpanel">
            <header className="panel__header">
              <h3>Historique</h3>
              {history.length > 0 && (
                <button type="button" className="link" onClick={() => setHistory([])}>
                  Effacer
                </button>
              )}
            </header>

            <AnimatePresence initial={false}>
              {history.length ? (
                <motion.ul
                  key="history"
                  className="history"
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {history.map((item) => (
                    <motion.li key={item.id} layout className="history__item">
                      <span>{item.value}</span>
                      <button type="button" onClick={() => toggleFavorite(item.value)}>
                        {isFavorite(item.value) ? 'Retirer' : 'Favori'}
                      </button>
                    </motion.li>
                  ))}
                </motion.ul>
              ) : (
                <motion.p
                  key="history-empty"
                  className="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  Les noms générés apparaîtront ici.
                </motion.p>
              )}
            </AnimatePresence>
          </section>
        </motion.section>

        <motion.section
          className="panel panel--favorites"
          layout
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.45, ease: 'easeOut' }}
        >
          <header className="panel__header">
            <h2>Favoris</h2>
            {favorites.length > 0 && (
              <button type="button" className="link" onClick={clearFavorites}>
                Tout effacer
              </button>
            )}
          </header>

          <AnimatePresence initial={false}>
            {favorites.length ? (
              <motion.ul
                key="favorites"
                className="list list--compact"
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {favorites.map((name) => (
                  <motion.li
                    key={name}
                    className="list-item list-item--compact"
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                  >
                    <span className="list-item__name">{name}</span>
                    <div className="list-item__actions">
                      <button type="button" onClick={() => handleCopy(name)}>
                        Copier
                      </button>
                      <button type="button" onClick={() => toggleFavorite(name)}>
                        Retirer
                      </button>
                    </div>
                  </motion.li>
                ))}
              </motion.ul>
            ) : (
              <motion.p
                key="favorites-empty"
                className="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Ajoute tes coups de cœur pour les retrouver rapidement.
              </motion.p>
            )}
          </AnimatePresence>
        </motion.section>
      </main>

      <AnimatePresence>
        {status && (
          <motion.div
            key={status.message}
            className={`status status--${status.tone}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            role="status"
            aria-live="assertive"
          >
            {status.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
