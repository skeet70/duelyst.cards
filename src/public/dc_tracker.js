(function() {

  /** Tracking Logic **/
  const sendDeck = function () {
    const gameData = GamesManager.getInstance().playerGames.models[0].attributes;

    if (gameData.game_type !== 'ranked' || gameData.status !== 'over') return;

    const postData = {
      _id: gameData.game_id,
      opponentUsername: gameData.opponent_username,
      opponentGeneralId: gameData.opponent_general_id,
      opponentFactionId: gameData.opponent_faction_id,
      isDraw: gameData.is_draw,
      isWinner: gameData.is_winner,
      isPlayerOne: gameData.is_player_1,
      startTime: gameData.created_at,
      endTime: gameData.ended_at,
      generalId: gameData.general_id,
      factionId: gameData.faction_id,
      cards: gameData.deck_cards,
      rankBefore: gameData.rank_before,
      rankDelta: gameData.rank_delta,
      rankStarsBefore: gameData.rank_stars_before,
      rankStarsDelta: gameData.rank_stars_delta,
      apiKey: DC_API_KEY,
    }

    showNotification('Syncing with duelystcards.com');
    $.post('https://duelyst.cards/api/save-match', postData).then((res) => {
      showNotification('Syncing successful');
      $('#dc_notification').html(res)
      setTimeout(() => {
        hideNotification();
      }, 4000);
    });
  }

  const trackInGame = () => {
    console.log("In tracking.");
    const myId = GamesManager.getInstance().playerGames.models[0].attributes.user_id;
    const currentTurns = _.foldl(SDK.GameSession.instance.turns, (acc, turn) => {
      if (turn.playerId == myId) {
        const cardsInTurn = turn.steps
                              .filter(step => step.action.type == "PlayCardFromHandAction")
                              .map(step => SDK.CardFactory.cardForIdentifier(step.action.cardDataOrIndex.id).name);
        acc.push.apply(acc, cardsInTurn);
      }
      return acc;
    }, []);

    console.log(currentTurns);
  }

  const gameOverTasks = () => {
    console.log("Game Over callback.");
    sendDeck();
    trackInGame();
  }

  /** Timeout and EventBus Registration **/
  // Sends the match data over on app load
  setTimeout(sendDeck, 6000);
  SDK.NetworkManager.getInstance().getEventBus().on("network_game_event", ensureInGameTrigger)

  const ensureInGameTrigger = () => {
    const events = SDK.GameSession.getInstance().getEventBus()._events;
    if (!events.game_over || events.game_over.find(event -> event.context === true) == null) {
      console.log("Adding game over trigger.");
      SDK.GameSession.getInstance().getEventBus().on("game_over", gameOverTasks, true);
    }
    console.log("Done ensuring.");
  }

  /** Utility **/
  const notification = document.createElement('div');
  notification.setAttribute('id', 'dc_notification');
  notification.style.zIndex = 100;
  notification.style.backgroundColor = 'rgba(255, 255, 255, .85)';
  notification.style.position = 'absolute';
  notification.style.display = 'none';
  notification.style.top = '20px';
  notification.style.padding = '10px';
  notification.style.borderRadius = '25px';
  notification.style.left = '50%';
  notification.style.transform = 'translateX(-50%)';
  setTimeout(() => {
    document.querySelector('body').appendChild(notification);
  }, 5000);

  const showNotification = function (text = '') {
    $('#dc_notification').html(text);
    $('#dc_notification').show();
  }

  const hideNotification = function () {
    $('#dc_notification').hide();
  }
})();
