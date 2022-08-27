import ancientsData from './data/ancients.js';
import {brownCards, blueCards, greenCards} from './data/mythicCards/index.js';


class Eldritch {
    currentIndex = -1;

    currentAncient = ancientsData[0];
    currentLevel = 'normal';
    constructor() {
        this.prepareDeck();
    }

    setAncient(newId){
        this.currentAncient = ancientsData.find(({id})=>id === newId);
    }

    setLevel(newLevel){
        this.currentLevel = newLevel;
    }

    selectRandomPack(packSize, array) {
        const shuffled = this.shuffle([...array]);
        return shuffled.slice(0, packSize);
    }

    shuffle(array) {
        let currentIndex = array.length;
        let randomIndex;
        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex], array[currentIndex]];
        }
        return array;
    }
    isDifficult(level) {
       return ({difficulty}) => difficulty === level;
    }

    getSuperEasyPack = (packSize, pack) => {
        let cards = this.selectRandomPack(packSize, pack.filter(({difficulty}) => difficulty === 'easy'));
        let extension = [];

        if (cards.length < packSize) {
            extension = this.selectRandomPack(packSize - cards.length, pack.filter(({difficulty}) => difficulty === 'normal'))
        }
        return this.shuffle([...cards, ...extension]);
    }

    getEasyPack = (packSize, pack) => {
        let cards = pack.filter(({difficulty}) => difficulty !== 'hard');
        return this.selectRandomPack(packSize, cards);
    }

    getNormalPack = (packSize, pack) => {
        return this.selectRandomPack(packSize, pack);
    }

    getHardPack = (packSize, pack) => {
        let cards = pack.filter(({difficulty}) => difficulty !== 'easy');
        return this.selectRandomPack(packSize, cards);
    }

    getSuperHardPack = (packSize, pack) => {
        let cards = this.selectRandomPack(packSize, pack.filter(({difficulty}) => difficulty === 'hard'));
        let extension = [];

        if (cards.length < packSize) {
            extension = this.selectRandomPack(packSize - cards.length, pack.filter(({difficulty}) => difficulty === 'normal'))
        }
        return this.shuffle([...cards, ...extension]);
    }

    deckSelectFunc = {
        superEasy: this.getSuperEasyPack,
        easy: this.getEasyPack,
        normal: this.getNormalPack,
        hard: this.getHardPack,
        superHard: this.getSuperHardPack,
    }

    prepareDeck() {
        const ancient = this.currentAncient;
        const level = this.currentLevel;
        const totalGreenCount = ancient.firstStage.greenCards + ancient.secondStage.greenCards + ancient.thirdStage.greenCards;
        const totalBrownCount = ancient.firstStage.brownCards + ancient.secondStage.brownCards + ancient.thirdStage.brownCards;
        const totalBlueCount = ancient.firstStage.blueCards + ancient.secondStage.blueCards + ancient.thirdStage.blueCards;
        const getCards = this.deckSelectFunc[level];

        const _brownCards = getCards(totalBrownCount, brownCards);
        const _greenCards = getCards(totalGreenCount, greenCards);
        const _blueCards = getCards(totalBlueCount, blueCards);

        const firstStageCards = [
            ..._brownCards.splice(0, ancient.firstStage.brownCards),
            ..._greenCards.splice(0, ancient.firstStage.greenCards),
            ..._blueCards.splice(0, ancient.firstStage.blueCards)
        ].map(el => ({...el, stage: 'firstStage'}));
        const secondStageCards = [
            ..._brownCards.splice(0, ancient.secondStage.brownCards),
            ..._greenCards.splice(0, ancient.secondStage.greenCards),
            ..._blueCards.splice(0, ancient.secondStage.blueCards)
        ].map(el => ({...el, stage: 'secondStage'}));
        const thirdStageCards = [
            ..._brownCards.splice(0, ancient.thirdStage.brownCards),
            ..._greenCards.splice(0, ancient.thirdStage.greenCards),
            ..._blueCards.splice(0, ancient.thirdStage.blueCards)
        ].map(el => ({...el, stage: 'thirdStage'}));

        this.currentIndex = -1;
        this.currentDeck = [
            ... this.shuffle(firstStageCards),
            ... this.shuffle(secondStageCards),
            ...this.shuffle(thirdStageCards)
        ]
        return this.currentDeck;
    }

    getCard() {
        if (this.currentIndex >= this.currentDeck.length - 1) {
            return null;
        }

        this.currentIndex++;
        return this.currentDeck[this.currentIndex];
    }

    getCurrentDeck(){
       return this.currentDeck.slice(this.currentIndex > 0 ? this.currentIndex : 0);
    }
}

const eldritch = new Eldritch();

const cardsWrapper = document.querySelector('.cards-wrapper');
cardsWrapper.addEventListener('click', (ev) => {
    const card = ev.target.closest('.card');
    if (card) {
        levelWrapper.classList.remove('hidden')
        const selected = cardsWrapper.querySelector('.card.selected');
            if (selected) {
             selected.classList.remove('selected')
            }
        card.classList.add('selected');
        eldritch.setAncient(card.id);
        eldritch.prepareDeck();
        resetBoard();
    }
});

const levelWrapper = document.querySelector('.levels-wrapper');
const boardWrapper = document.querySelector('.board-wrapper');
levelWrapper.addEventListener('click', (ev) => {
    const level = ev.target.closest('.button');
    if (level) {
        const selected = levelWrapper.querySelector('.button.selected');
        if (selected) {
            selected.classList.remove('selected')
        }
        level.classList.add('selected');
        eldritch.setLevel(level.id);
        eldritch.prepareDeck();
        resetBoard();
        boardWrapper.classList.remove('hidden')
    }
});


function resetBoard(){
    backCard.classList.remove('empty');
    frontCard.style.backgroundImage = '';
    updateCardTracker();
}

function updateCardTracker() {
    const stages = ['firstStage', 'secondStage', 'thirdStage'];
    const colors = ['brown', 'green', 'blue'];
    const deck = eldritch.getCurrentDeck();
    const [openedCard, ...remainDeck] = deck;

    const activeStage = document.querySelector('.stage.active');
    if (activeStage){
        activeStage.classList.remove('active');
    }
    document.querySelector(`.${openedCard.stage}`).classList.add('active')

    stages.forEach(stage => {
        colors.forEach(color => {
            const elColor = document.querySelector(`.${stage} .${color}`);
            elColor.innerHTML = (eldritch.currentIndex >= 0 ? remainDeck : deck).filter(el => el.stage === stage && el.color === color).length;
        });
    });
    if (remainDeck.length === 0) {
        backCard.classList.add('empty');
    }

}

const frontCard = document.querySelector('.card-front');
const backCard = document.querySelector('.card-back');
backCard.addEventListener('click', () => {
    const currentCard = eldritch.getCard();
    if (currentCard){
        const {color, id} = currentCard;
        frontCard.style.backgroundImage = `url(./assets/MythicCards/${color}/${id}.png)`;
    }
    updateCardTracker();
})



