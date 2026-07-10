const cms = {
  password: import.meta.env.VITE_DRAFT_PASSWORD,
  timing: {
    pickRevealDelay: 5000,
    tickerDelay: 300,
    revealMatchDuration: 900,
  },
  copy: {
    leagueName: 'Friends and Rudy League',
    title: 'Draft Order Lottery',
    passwordLabel: 'Password',
    unlockButton: 'Enter draft',
    draftButton: 'Draft order',
    drawingButton: 'Drawing...',
    passwordError: 'Wrong password',
    winnerSuffix: 'CONGRATS!',
    resultsLabel: 'Draft order results',
  },
};

export default cms;
