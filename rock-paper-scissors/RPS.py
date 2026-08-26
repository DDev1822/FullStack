COUNTER = {
    "R": "P",
    "P": "S",
    "S": "R",
}


_state = {
    "our_history": [],
    "scores": {
        "quincy": 0,
        "abbey": 0,
        "kris": 0,
        "mrugesh": 0,
    },
    "last_predictions": None,
}


def _reset():
    """Reset only our player state at the start of a new match."""
    _state["our_history"].clear()
    _state["scores"] = {
        "quincy": 0,
        "abbey": 0,
        "kris": 0,
        "mrugesh": 0,
    }
    _state["last_predictions"] = None


def _predict_quincy():
    """Predict Quincy's fixed five-move cycle."""
    round_number = len(_state["our_history"]) + 1
    choices = ["R", "R", "P", "P", "S"]
    return choices[round_number % len(choices)]


def _predict_kris():
    """Kris counters our previous play."""
    previous_our_play = (
        _state["our_history"][-1]
        if _state["our_history"]
        else "R"
    )
    return COUNTER[previous_our_play]


def _predict_mrugesh():
    """Mrugesh counters the most frequent move in our last ten plays."""
    history = [""] + _state["our_history"]
    last_ten = history[-10:]

    most_frequent = max(set(last_ten), key=last_ten.count)
    if most_frequent == "":
        most_frequent = "S"

    return COUNTER[most_frequent]


def _predict_abbey():
    """Reproduce Abbey's first-order transition model of our moves."""
    history = ["R"] + _state["our_history"]

    play_order = {
        "RR": 0,
        "RP": 0,
        "RS": 0,
        "PR": 0,
        "PP": 0,
        "PS": 0,
        "SR": 0,
        "SP": 0,
        "SS": 0,
    }

    for index in range(len(history) - 1):
        pair = history[index] + history[index + 1]
        if pair in play_order:
            play_order[pair] += 1

    previous_our_play = (
        _state["our_history"][-1]
        if _state["our_history"]
        else "R"
    )

    potential_plays = [
        previous_our_play + "R",
        previous_our_play + "P",
        previous_our_play + "S",
    ]

    predicted_pair = max(
        potential_plays,
        key=lambda pair: play_order[pair],
    )
    predicted_our_move = predicted_pair[-1]

    # Abbey counters the move she predicts we will make.
    return COUNTER[predicted_our_move]


def _predict_all():
    return {
        "quincy": _predict_quincy(),
        "abbey": _predict_abbey(),
        "kris": _predict_kris(),
        "mrugesh": _predict_mrugesh(),
    }


def player(prev_play):
    """Adaptive Rock-Paper-Scissors player.

    Four candidate opponent models predict the next move. Their scores are
    updated from the observed previous move, and the best-performing model
    drives the next counter-move.
    """
    if prev_play == "":
        _reset()
    else:
        last_predictions = _state["last_predictions"]
        if last_predictions is not None:
            for opponent, prediction in last_predictions.items():
                if prediction == prev_play:
                    _state["scores"][opponent] += 2
                else:
                    _state["scores"][opponent] -= 1

    predictions = _predict_all()

    best_model = max(
        _state["scores"],
        key=_state["scores"].get,
    )
    predicted_opponent_play = predictions[best_model]

    our_play = COUNTER[predicted_opponent_play]

    _state["our_history"].append(our_play)
    _state["last_predictions"] = predictions

    return our_play
