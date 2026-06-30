import React, { useEffect, useMemo, useRef, useState } from 'react';
import members from './members.js';

const pickRevealDelay = 5000;
const tickerDelay = 300;
const tickerNames = members.map((member) => member.name);

function shuffle(items) {
  const shuffled = [...items];

  for (let currentIndex = shuffled.length - 1; currentIndex > 0; currentIndex -= 1) {
    const randomIndex = Math.floor(Math.random() * (currentIndex + 1));
    [shuffled[currentIndex], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[currentIndex],
    ];
  }

  return shuffled;
}

function App() {
  const [draftOrder, setDraftOrder] = useState([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timeoutsRef = useRef([]);

  const revealedPicks = useMemo(
    () =>
      draftOrder
        .map((member, index) => ({
          member,
          pickNumber: index + 1,
        }))
        .slice(members.length - revealedCount),
    [draftOrder, revealedCount],
  );

  const winner = revealedCount === members.length ? draftOrder[0] : null;

  useEffect(() => {
    if (!isRunning) {
      return undefined;
    }

    const ticker = window.setInterval(() => {
      setTickerIndex((current) => (current + 1) % tickerNames.length);
    }, tickerDelay);

    return () => window.clearInterval(ticker);
  }, [isRunning]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(window.clearTimeout);
    };
  }, []);

  function startLottery() {
    timeoutsRef.current.forEach(window.clearTimeout);
    timeoutsRef.current = [];

    const newOrder = shuffle(members);
    setDraftOrder(newOrder);
    setRevealedCount(0);
    setTickerIndex(0);
    setIsRunning(true);

    for (let pick = members.length; pick >= 1; pick -= 1) {
      const delay = (members.length - pick + 1) * pickRevealDelay;
      const timeout = window.setTimeout(() => {
        setRevealedCount((current) =>
          Math.max(current, members.length - pick + 1),
        );

        if (pick === 1) {
          setIsRunning(false);
        }
      }, delay);

      timeoutsRef.current.push(timeout);
    }
  }

  return (
    <main className={revealedPicks.length > 0 ? 'app app--active' : 'app'}>
      <section className="intro">
        <div>
          <p className="eyebrow">Friends and Rudy League</p>
          <h1>Draft Order Lottery</h1>
        </div>

        <div className="actions">
          <button type="button" onClick={startLottery} disabled={isRunning}>
            {isRunning ? 'Drawing...' : 'Draft order'}
          </button>
          <p className="ticker" aria-live="polite">
            {winner ? `${winner.name}, CONGRATS!` : tickerNames[tickerIndex]}
          </p>
        </div>
      </section>

      {revealedPicks.length > 0 && (
        <section className="results" aria-label="Draft order results">
          {revealedPicks.map(({ member, pickNumber }) => (
            <article className="pick-card" key={member.name}>
              <p className="pick-number">Pick {pickNumber}</p>
              <img
                src={member.image}
                alt={member.name}
                referrerPolicy="no-referrer"
              />
              <h2>{member.name}</h2>
              <p>{member.tagline}</p>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

export default App;
