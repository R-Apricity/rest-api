import { BingChat } from "bing-chat-rnz"

// instantiate the BingChat class
const api = new BingChat({
  cookie:
    "1UKzkhzT5-kSQJtQ-8u9wI-hZ_UjxvQARxVqCWObkQ4zhfaZYbZaqOY1X5pa8_xdrvjwutbwMHFQRfPlwNqvNlPMUf0T8BNQ23wHVTjbT0m8nDwGTZygiC64CkZ_7NnKg67QaZQ4fwz5BcUGBhYlMLFJbpB8uPGWAObyj4UX0HvNcUF13rVg182JOpzd_XbRTxySUYqFJP_ivV1-7X_sm1mNdM9NiJjdX4v_Yq5wIbb9cP57dznehX1y_XfJ8rb2o"
})

async function askBingChat(message, options) {
  const res = await api.sendMessage(message)

  console.log(res);
}

askBingChat("Tell me about themis (TMS) vesting schedule")