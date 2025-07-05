import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";

const zodiacSigns = [
  { name: "Aries", emoji: "♈", date: "Mar 21 – Apr 19" },
  { name: "Taurus", emoji: "♉", date: "Apr 20 – May 20" },
  { name: "Gemini", emoji: "♊", date: "May 21 – Jun 20" },
  { name: "Cancer", emoji: "♋", date: "Jun 21 – Jul 22" },
  { name: "Leo", emoji: "♌", date: "Jul 23 – Aug 22" },
  { name: "Virgo", emoji: "♍", date: "Aug 23 – Sep 22" },
  { name: "Libra", emoji: "♎", date: "Sep 23 – Oct 22" },
  { name: "Scorpio", emoji: "♏", date: "Oct 23 – Nov 21" },
  { name: "Sagittarius", emoji: "♐", date: "Nov 22 – Dec 21" },
  { name: "Capricorn", emoji: "♑", date: "Dec 22 – Jan 19" },
  { name: "Aquarius", emoji: "♒", date: "Jan 20 – Feb 18" },
  { name: "Pisces", emoji: "♓", date: "Feb 19 – Mar 20" },
];

export default function Horoscope() {
  const [selectedSign, setSelectedSign] = useState<string | null>(null);
  const [horoscope, setHoroscope] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedSign) {
      setLoading(true);
      // Replace this with your backend route
      axios
        .get(`/api/horoscope?sign=${selectedSign.toLowerCase()}`)
        .then((res) => {
          setHoroscope(res.data.horoscope);
          setLoading(false);
        })
        .catch(() => {
          setHoroscope("Unable to fetch horoscope. Please try again later.");
          setLoading(false);
        });
    }
  }, [selectedSign]);

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="rounded-2xl bg-gradient-to-b from-background via-muted to-background shadow-xl p-6"
      >
        <h2 className="text-3xl font-bold text-center mb-4 text-primary">
          ✨ Your Daily Horoscope ✨
        </h2>
        {!selectedSign && (
          <>
            <p className="text-center text-muted-foreground mb-6">
              Select your Zodiac sign to reveal today’s insights
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {zodiacSigns.map((sign) => (
                <motion.button
                  key={sign.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedSign(sign.name)}
                  className="rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white p-4 shadow hover:shadow-lg transition"
                >
                  <span className="text-3xl">{sign.emoji}</span>
                  <div className="mt-2 font-semibold">{sign.name}</div>
                  <div className="text-sm text-muted-foreground">{sign.date}</div>
                </motion.button>
              ))}
            </div>
          </>
        )}

        {selectedSign && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6"
          >
            <button
              onClick={() => {
                setSelectedSign(null);
                setHoroscope(null);
              }}
              className="mb-4 text-sm text-secondary hover:text-primary transition"
            >
              ← Back to signs
            </button>
            <h3 className="text-2xl font-bold mb-2">
              {selectedSign} Horoscope
            </h3>
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : (
              <p className="text-lg leading-relaxed text-foreground">
                {horoscope}
              </p>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
