// import postCard from "../../model/postCard"

// // WILL BREAK THE CODE
// function addCard(req, res, next) {
//     if (!req.body.front_text) {next(new Error('front text is required'))}
//     const cardDetails = {
//         front_text: req.body.front_text,
//         front_image: req.body.front_image || null,
//         back_text: req.body.back_text || null,
//         back_image: req.body.back_image || null,
//         important: req.body.important || null,
//         color: req.body.color || `#FFF`
//     }
//     // step 1: add card to cards table, returning card_id
//     // step 2: add card_id to end of every collection matching deck_id
// }

// module.exports = addCard;
