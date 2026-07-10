import React, { useEffect, useMemo, useRef, useState } from 'react';
import cms from './cms.js';
import members from './members.js';

const { copy, password, timing } = cms;

function getRandomIndex(length, currentIndex = -1) {
  if (length <= 1) {
    return 0;
  }

  let nextIndex = Math.floor(Math.random() * length);

  while (nextIndex === currentIndex) {
    nextIndex = Math.floor(Math.random() * length);
  }

  return nextIndex;
}

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
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [draftOrder, setDraftOrder] = useState([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [matchedReveal, setMatchedReveal] = useState(null);
  const [matchedNames, setMatchedNames] = useState([]);
  const timeoutsRef = useRef([]);
  const matchTimeoutRef = useRef(null);

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
  const tickerPool = useMemo(() => {
    if (winner) {
      return [winner];
    }

    if (draftOrder.length === members.length) {
      return draftOrder.slice(0, members.length - revealedCount);
    }

    return members;
  }, [draftOrder, revealedCount, winner]);
  const tickerMember = tickerPool[tickerIndex % tickerPool.length] || members[0];
  const displayedTickerMember = matchedReveal || tickerMember;

  useEffect(() => {
    if (!isRunning || tickerPool.length === 0) {
      return undefined;
    }

    const ticker = window.setInterval(() => {
      setTickerIndex((current) => getRandomIndex(tickerPool.length, current));
    }, timing.tickerDelay);

    return () => window.clearInterval(ticker);
  }, [isRunning, tickerPool.length]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(window.clearTimeout);
      window.clearTimeout(matchTimeoutRef.current);
    };
  }, []);

  function startLottery() {
    timeoutsRef.current.forEach(window.clearTimeout);
    window.clearTimeout(matchTimeoutRef.current);
    timeoutsRef.current = [];
    matchTimeoutRef.current = null;

    const newOrder = shuffle(members);
    setDraftOrder(newOrder);
    setRevealedCount(0);
    setTickerIndex(getRandomIndex(newOrder.length));
    setMatchedReveal(null);
    setMatchedNames([]);
    setIsRunning(true);

    for (let pick = members.length; pick >= 2; pick -= 1) {
      const delay = (members.length - pick + 1) * timing.pickRevealDelay;
      const timeout = window.setTimeout(() => {
        const nextRevealedCount =
          pick === 2 ? members.length : members.length - pick + 1;
        const newReveals = pick === 2 ? newOrder.slice(0, 2) : [newOrder[pick - 1]];
        const featuredReveal = pick === 2 ? newOrder[0] : newReveals[0];

        setRevealedCount((current) =>
          Math.max(current, nextRevealedCount),
        );
        setMatchedReveal(featuredReveal);
        setMatchedNames((current) => [
          ...new Set([
            ...current,
            ...newReveals.map((member) => member.name),
          ]),
        ]);

        window.clearTimeout(matchTimeoutRef.current);
        matchTimeoutRef.current = window.setTimeout(() => {
          setMatchedReveal(null);
          matchTimeoutRef.current = null;
        }, timing.revealMatchDuration);

        if (pick === 2) {
          setIsRunning(false);
        }
      }, delay);

      timeoutsRef.current.push(timeout);
    }
  }

  function unlockDraft(event) {
    event.preventDefault();

    if (passwordInput.trim() === password) {
      setIsUnlocked(true);
      setPasswordError('');
      return;
    }

    setPasswordError(copy.passwordError);
  }

  if (!isUnlocked) {
    return (
      <main className="app app--gate">
        <section className="gate">
          <p className="eyebrow">{copy.leagueName}</p>
          <h1>{copy.title}</h1>
          <form className="gate-form" onSubmit={unlockDraft}>
            <label htmlFor="draft-password">{copy.passwordLabel}</label>
            <input
              id="draft-password"
              type="password"
              value={passwordInput}
              onChange={(event) => {
                setPasswordInput(event.target.value);
                setPasswordError('');
              }}
              autoComplete="off"
            />
            <button type="submit">{copy.unlockButton}</button>
            {passwordError && (
              <p className="gate-error" role="alert">
                {passwordError}
              </p>
            )}
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className={revealedPicks.length > 0 ? 'app app--active' : 'app'}>
      <section className="intro">
        <div>
          <p className="eyebrow">{copy.leagueName}</p>
          <h1>{copy.title}</h1>
        </div>

        <div className="actions">
          <button type="button" onClick={startLottery} disabled={isRunning}>
            {isRunning ? copy.drawingButton : copy.draftButton}
          </button>
          <div
            className={matchedReveal ? 'ticker ticker--match' : 'ticker'}
            aria-live="polite"
          >
            <div className="ticker-frame">
              <img
                src={displayedTickerMember.image}
                alt={displayedTickerMember.name}
                referrerPolicy="no-referrer"
              />
            </div>
            <p>
              {winner && !matchedReveal
                ? `${winner.name}, ${copy.winnerSuffix}`
                : displayedTickerMember.name}
            </p>
          </div>
        </div>
      </section>

      {revealedPicks.length > 0 && (
        <section className="results" aria-label={copy.resultsLabel}>
          {revealedPicks.map(({ member, pickNumber }) => {
            const cardClasses = [
              'pick-card',
              matchedNames.includes(member.name) ? 'pick-card--matched' : '',
              pickNumber <= 2 ? 'pick-card--spotlight' : '',
              pickNumber === 1 ? 'pick-card--winner' : '',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <article className={cardClasses} key={member.name}>
                <p className="pick-number">Pick {pickNumber}</p>
                <img
                  src={member.image}
                  alt={member.name}
                  referrerPolicy="no-referrer"
                />
                <h2>{member.name}</h2>
                <p>{member.tagline}</p>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}

export default App;
