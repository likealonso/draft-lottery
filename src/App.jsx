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
  const [isPaused, setIsPaused] = useState(false);
  const [hasStartedDraft, setHasStartedDraft] = useState(false);
  const [matchedReveal, setMatchedReveal] = useState(null);
  const [matchedNames, setMatchedNames] = useState([]);
  const timeoutsRef = useRef([]);
  const matchTimeoutRef = useRef(null);
  const revealQueueRef = useRef([]);
  const revealIndexRef = useRef(0);
  const revealStartedAtRef = useRef(null);

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

  const sortedMembers = useMemo(
    () => [...members].sort((a, b) => a.name.localeCompare(b.name)),
    [],
  );
  const topParticipants = sortedMembers.slice(0, 5);
  const bottomParticipants = sortedMembers.slice(5);
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

  function clearDraftTimers() {
    timeoutsRef.current.forEach(window.clearTimeout);
    window.clearTimeout(matchTimeoutRef.current);
    timeoutsRef.current = [];
    matchTimeoutRef.current = null;
  }

  function resetDraft() {
    clearDraftTimers();
    revealQueueRef.current = [];
    revealIndexRef.current = 0;
    revealStartedAtRef.current = null;
    setDraftOrder([]);
    setRevealedCount(0);
    setTickerIndex(0);
    setMatchedReveal(null);
    setMatchedNames([]);
    setIsRunning(false);
    setIsPaused(false);
    setHasStartedDraft(false);
  }

  function revealNextPick(newOrder) {
    const nextReveal = revealQueueRef.current[revealIndexRef.current];

    if (!nextReveal) {
      setIsRunning(false);
      setIsPaused(false);
      revealStartedAtRef.current = null;
      return;
    }

    const delay = Math.max(0, nextReveal.remainingMs);
    const timeout = window.setTimeout(() => {
      const nextRevealedCount =
        nextReveal.pick === 2 ? members.length : members.length - nextReveal.pick + 1;
      const newReveals =
        nextReveal.pick === 2 ? newOrder.slice(0, 2) : [newOrder[nextReveal.pick - 1]];
      const featuredReveal =
        nextReveal.pick === 2 ? newOrder[0] : newReveals[0];

      setRevealedCount((current) => Math.max(current, nextRevealedCount));
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

      revealIndexRef.current += 1;

      if (nextReveal.pick === 2) {
        setIsRunning(false);
        setIsPaused(false);
        revealStartedAtRef.current = null;
        return;
      }

      revealNextPick(newOrder);
    }, delay);

    timeoutsRef.current.push(timeout);
    revealStartedAtRef.current = Date.now();
  }

  function startLottery() {
    clearDraftTimers();

    const newOrder = shuffle(members);
    revealQueueRef.current = Array.from({ length: members.length - 1 }, (_, index) => {
      const pick = members.length - index;

      return {
        pick,
        remainingMs: timing.pickRevealDelay,
      };
    }).filter((item) => item.pick >= 2);
    revealIndexRef.current = 0;
    revealStartedAtRef.current = null;

    setHasStartedDraft(true);
    setDraftOrder(newOrder);
    setRevealedCount(0);
    setTickerIndex(getRandomIndex(newOrder.length));
    setMatchedReveal(null);
    setMatchedNames([]);
    setIsRunning(true);
    setIsPaused(false);

    revealNextPick(newOrder);
  }

  function togglePauseDraft() {
    if (!hasStartedDraft) {
      return;
    }

    if (isPaused) {
      setIsPaused(false);
      setIsRunning(true);
      revealNextPick(draftOrder);
      return;
    }

    if (revealStartedAtRef.current && revealQueueRef.current[revealIndexRef.current]) {
      const elapsed = Date.now() - revealStartedAtRef.current;
      revealQueueRef.current[revealIndexRef.current].remainingMs = Math.max(
        0,
        revealQueueRef.current[revealIndexRef.current].remainingMs - elapsed,
      );
    }

    clearDraftTimers();
    setIsRunning(false);
    setIsPaused(true);
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
          <div className="gate-photos" aria-label="Participants preview">
            {members.map((member) => (
              <img
                key={member.name}
                src={member.image}
                alt={member.name}
                referrerPolicy="no-referrer"
              />
            ))}
          </div>
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
          <div className="action-buttons">
            <button
              type="button"
              onClick={isPaused ? resetDraft : startLottery}
              disabled={isRunning}
            >
              {isPaused
                ? copy.resetButton
                : isRunning
                  ? copy.drawingButton
                  : copy.draftButton}
            </button>
            <button
              type="button"
              onClick={togglePauseDraft}
              disabled={!hasStartedDraft || (!isRunning && !isPaused)}
            >
              {isPaused ? copy.resumeButton : copy.pauseButton}
            </button>
          </div>
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

      {!hasStartedDraft && (
        <section className="participants" aria-label="Participants">
          <h2 className="participants-title">Today's participants (in alphabetical order)</h2>
          <div className="participants-row">
            {topParticipants.map((member) => (
              <article className="participant-card" key={member.name}>
                <img
                  src={member.image}
                  alt={member.name}
                  referrerPolicy="no-referrer"
                />
                <h2>{member.name}</h2>
                <p>{member.tagline}</p>
              </article>
            ))}
          </div>

          <div className="participants-row participants-row--bottom">
            {bottomParticipants.map((member) => (
              <article className="participant-card" key={member.name}>
                <img
                  src={member.image}
                  alt={member.name}
                  referrerPolicy="no-referrer"
                />
                <h2>{member.name}</h2>
                <p>{member.tagline}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {hasStartedDraft && revealedPicks.length > 0 && (
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
