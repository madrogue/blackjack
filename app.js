const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
let deck = [];
let playerHands = [];
let dealerHand = [];
let bank = 1000;
let credits = 100;
let betAmount = 0;
let settings = {
  payout: '3:2',
  minBet: 1,
  decks: 1,
  surrender: true,
  insurance: true,
  showDealerImage: true
};
let dealerSecondCardElement;
let cutCardPosition;

function loadGameData() {
  bank = parseInt(localStorage.getItem('bank')) || 1000;
  credits = parseInt(localStorage.getItem('credits')) || 100;
  settings = JSON.parse(localStorage.getItem('settings')) || settings;
  updateStatusArea();
  updateSettingsUI();
  updateDealerImage();
}

function saveGameData() {
  localStorage.setItem('bank', bank);
  localStorage.setItem('credits', credits);
  localStorage.setItem('settings', JSON.stringify(settings));
}

function createCardSVG(rank, suit) {
  const suitSymbols = {
    'Hearts': '♥',
    'Diamonds': '♦',
    'Clubs': '♣',
    'Spades': '♠'
  };

  const color = (suit === 'Hearts' || suit === 'Diamonds') ? 'red' : 'black';
  const svgContent = `
    <svg width="100" height="140" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="140" fill="white" stroke="white" />
        <text x="10" y="20" font-family="Arial" font-size="20" fill="${color}">${rank}</text>
        <text x="10" y="40" font-family="Arial" font-size="20" fill="${color}">${suitSymbols[suit]}</text>
        <text x="50" y="100" font-family="Arial" font-size="60" fill="${color}" text-anchor="middle">${suitSymbols[suit]}</text>
    </svg>
  `;

  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);

  return url;
}

function createDeck() {
  deck = [];
  for (let i = 0; i < settings.decks; i++) {
    for (let suit of suits) {
      for (let rank of ranks) {
        deck.push({ suit, rank });
      }
    }
  }
  shuffleDeck();
  if (settings.decks > 1) {
    placeCutCard();
  }
}

function shuffleDeck() {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

function placeCutCard() {
  const min = Math.floor(deck.length * 0.5);
  const max = Math.floor(deck.length * 0.75);
  cutCardPosition = Math.floor(Math.random() * (max - min + 1)) + min;
}

function dealCard() {
  if (deck.length === 0 || (settings.decks > 1 && deck.length <= cutCardPosition)) {
    createDeck();
  }
  return deck.pop();
}

function startGame() {
  createDeck();
  playerHands = [{ cards: [dealCard(), dealCard()], bet: betAmount }];
  dealerHand = [dealCard(), dealCard()];
  updateUI();
  toggleControls();
  checkSplitOption();
}

function updateUI() {
  const playerHandsElement = document.getElementById('player-hands');
  const dealerHandsElement = document.getElementById('dealer-hands');

  playerHandsElement.innerHTML = '';
  dealerHandsElement.innerHTML = '';

  playerHands.forEach((hand, handIndex) => {
    const handElement = document.createElement('div');
    handElement.classList.add('player-hand');
    handElement.innerHTML = `
      <div class="bet-container">
        <div class="bet-amount control-button poker-chip">$${hand.bet}</div>
        <button class="double-down-button control-button" data-hand-index="${handIndex}">DD</button>
      </div>`;
    const cardsElement = document.createElement('div');
    cardsElement.classList.add('player-cards');
    hand.cards.forEach((card, cardIndex) => {
      if (card) {
        const cardElement = document.createElement('img');
        cardElement.src = createCardSVG(card.rank, card.suit);
        cardElement.classList.add('card', 'dealing');
        cardElement.style.animationDelay = `${cardIndex * 0.5}s`;
        cardsElement.appendChild(cardElement);
      }
    });
    handElement.appendChild(cardsElement);
    playerHandsElement.appendChild(handElement);
  });

  dealerHand.forEach((card, index) => {
    if (card) {
      const cardElement = document.createElement('img');
      if (index === 1) {
        cardElement.src = '';
        cardElement.classList.add('card', 'dealing', 'face-down');
        dealerSecondCardElement = cardElement;
      } else {
        cardElement.src = createCardSVG(card.rank, card.suit);
        cardElement.classList.add('card', 'dealing');
      }
      cardElement.style.animationDelay = `${index * 0.5}s`;
      dealerHandsElement.appendChild(cardElement);
    }
  });

  updateDealerImage();
  updateDoubleDownButtons();
}

function updateStatusArea() {
  document.getElementById('amount-bank').innerText = `$${bank}`;
  document.getElementById('amount-credits').innerText = `$${credits}`;
  document.getElementById('transfer-amount-bank').innerText = `$${bank}`;
  document.getElementById('transfer-amount-credits').innerText = `$${credits}`;
}

function updateSettingsUI() {
  document.getElementById('payout').value = settings.payout;
  document.getElementById('min-bet').value = settings.minBet;
  document.getElementById('decks').value = settings.decks;
  document.getElementById('surrender').checked = settings.surrender;
  document.getElementById('insurance').checked = settings.insurance;
  document.getElementById('show-dealer-image').checked = settings.showDealerImage;
}

function updateDealerImage() {
  const dealerArea = document.getElementById('dealer-area');
  if (settings.showDealerImage) {
    dealerArea.classList.add('bg-dealer');
  } else {
    dealerArea.classList.remove('bg-dealer');
  }
}

function stand() {
  if (dealerSecondCardElement) {
    const secondCard = dealerHand[1];
    dealerSecondCardElement.src = createCardSVG(secondCard.rank, secondCard.suit);
    dealerSecondCardElement.classList.remove('face-down');
  }
  // Additional logic for the dealer's turn can be added here
}

function toggleControls() {
  const betControls = document.getElementById('bet-controls');
  const gameControls = document.getElementById('game-controls');
  if (betControls.style.display === 'none') {
    betControls.style.display = 'flex';
    gameControls.style.display = 'none';
  } else {
    betControls.style.display = 'none';
    gameControls.style.display = 'flex';
  }
}

function updateBetAmount() {
  document.getElementById('player-bet').innerText = `$${betAmount}`;
}

function checkSplitOption() {
  const splitButton = document.getElementById('split-button');
  const firstHand = playerHands[0];
  if (firstHand.cards.length === 2 && firstHand.cards[0].rank === firstHand.cards[1].rank) {
    splitButton.style.display = 'block';
  } else {
    splitButton.style.display = 'none';
  }
}

function splitHand() {
  const firstHand = playerHands[0];
  if (firstHand.cards.length === 2 && firstHand.cards[0].rank === firstHand.cards[1].rank) {
    const newHand1 = { cards: [firstHand.cards[0], dealCard()], bet: firstHand.bet };
    const newHand2 = { cards: [firstHand.cards[1], dealCard()], bet: firstHand.bet };
    playerHands = [newHand1, newHand2];
    credits -= firstHand.bet;
    updateUI();
    updateStatusArea();
    checkSplitOption();
  }
}

function updateDoubleDownButtons() {
  document.querySelectorAll('.double-down-button').forEach(button => {
    const handIndex = parseInt(button.getAttribute('data-hand-index'));
    const hand = playerHands[handIndex];
    if (credits >= hand.bet) {
      button.disabled = false;
      button.addEventListener('click', () => doubleDown(handIndex));
    } else {
      button.disabled = true;
    }
  });
}

function doubleDown(handIndex) {
  const hand = playerHands[handIndex];
  if (credits >= hand.bet) {
    credits -= hand.bet;
    hand.bet *= 2;
    hand.cards.push(dealCard());
    updateUI();
    updateStatusArea();
  }
}

document.querySelectorAll('.bet-button').forEach(button => {
  button.addEventListener('click', () => {
    const betValue = parseInt(button.getAttribute('data-bet'));
    betAmount += betValue;
    updateBetAmount();
  });
});

document.getElementById('clear-bet-button').addEventListener('click', () => {
  betAmount = 0;
  updateBetAmount();
});

document.getElementById('deal-button').addEventListener('click', startGame);
document.getElementById('stand-button').addEventListener('click', stand);
document.getElementById('split-button').addEventListener('click', splitHand);

document.getElementById('bank').addEventListener('click', showTransferPopup);
document.getElementById('close-popup').addEventListener('click', closeTransferPopup);
document.getElementById('to-credits-button').addEventListener('click', transferToCredits);
document.getElementById('to-bank-button').addEventListener('click', transferToBank);
document.getElementById('settings-button').addEventListener('click', showSettingsPopup);
document.getElementById('close-settings-popup').addEventListener('click', closeSettingsPopup);
document.getElementById('save-settings-button').addEventListener('click', saveSettings);

function showTransferPopup() {
  document.getElementById('transfer-popup').style.display = 'block';
}

function closeTransferPopup() {
  document.getElementById('transfer-popup').style.display = 'none';
}

function showSettingsPopup() {
  document.getElementById('settings-popup').style.display = 'block';
}

function closeSettingsPopup() {
  document.getElementById('settings-popup').style.display = 'none';
}

function saveSettings() {
  settings.payout = document.getElementById('payout').value;
  settings.minBet = parseInt(document.getElementById('min-bet').value);
  settings.decks = parseInt(document.getElementById('decks').value);
  settings.surrender = document.getElementById('surrender').checked;
  settings.insurance = document.getElementById('insurance').checked;
  settings.showDealerImage = document.getElementById('show-dealer-image').checked;
  saveGameData();
  updateDealerImage();
  closeSettingsPopup();
}

function transferToCredits() {
  const amount = parseInt(document.getElementById('transfer-amount').value);
  if (bank >= amount) {
    bank -= amount;
    credits += amount;
    updateStatusArea();
    saveGameData();
  } else {
    alert('Not enough funds in the bank.');
  }
}

function transferToBank() {
  const amount = parseInt(document.getElementById('transfer-amount').value);
  if (credits >= amount) {
    credits -= amount;
    bank += amount;
    updateStatusArea();
    saveGameData();
  } else {
    alert('Not enough credits.');
  }
}

// Load game data when the app loads
window.onload = loadGameData;