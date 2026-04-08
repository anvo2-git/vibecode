import Link from "next/link";

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="font-serif text-5xl md:text-6xl font-medium text-stone-900 mb-3">
          The Common Nose
        </h1>
        <p className="font-serif italic text-lg text-stone-500 mb-6">
          Tell us your favourites. We&apos;ll find you something new.
        </p>
        <p className="text-stone-600 max-w-lg mx-auto leading-relaxed">
          A recommendation engine built on 68,000 fragrances. We use accord-based
          similarity &mdash; how perfumes actually smell &mdash; to find your next favourite scent.
        </p>
      </div>

      {/* Two paths */}
      <div className="grid md:grid-cols-2 gap-6 mb-16">
        <Link
          href="/explore"
          className="group block bg-white border border-stone-200 rounded-xl p-8 hover:border-stone-400 transition-all hover:shadow-sm"
        >
          <div className="text-2xl mb-3">&#128269;</div>
          <h2 className="font-serif text-xl font-medium text-stone-900 mb-2 group-hover:text-stone-600 transition-colors">
            I know what I like
          </h2>
          <p className="text-sm text-stone-500 leading-relaxed">
            Search for your favourite perfumes, pick up to 3, and get personalised
            recommendations based on their accord profiles.
          </p>
        </Link>
        <Link
          href="/quiz"
          className="group block bg-white border border-stone-200 rounded-xl p-8 hover:border-stone-400 transition-all hover:shadow-sm"
        >
          <div className="text-2xl mb-3">&#10024;</div>
          <h2 className="font-serif text-xl font-medium text-stone-900 mb-2 group-hover:text-stone-600 transition-colors">
            I&apos;m new to perfume
          </h2>
          <p className="text-sm text-stone-500 leading-relaxed">
            Take a short quiz about your preferences and we&apos;ll match you with
            accords and starter perfumes tailored to your taste.
          </p>
        </Link>
      </div>

      {/* How it works */}
      <div className="border-t border-stone-200 pt-12">
        <h2 className="font-serif text-2xl font-medium text-stone-900 text-center mb-8">
          How it works
        </h2>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="w-10 h-10 rounded-full bg-stone-900 text-white flex items-center justify-center mx-auto mb-3 text-sm font-medium">
              1
            </div>
            <h3 className="font-medium text-stone-900 mb-1">Pick your perfumes</h3>
            <p className="text-sm text-stone-500">
              Search our catalog of 68,000 fragrances or take the quiz to discover your accord profile.
            </p>
          </div>
          <div>
            <div className="w-10 h-10 rounded-full bg-stone-900 text-white flex items-center justify-center mx-auto mb-3 text-sm font-medium">
              2
            </div>
            <h3 className="font-medium text-stone-900 mb-1">Get recommendations</h3>
            <p className="text-sm text-stone-500">
              We analyse the accord DNA of your picks and find similar fragrances using cosine similarity.
            </p>
          </div>
          <div>
            <div className="w-10 h-10 rounded-full bg-stone-900 text-white flex items-center justify-center mx-auto mb-3 text-sm font-medium">
              3
            </div>
            <h3 className="font-medium text-stone-900 mb-1">Refine with votes</h3>
            <p className="text-sm text-stone-500">
              Thumbs up or down on recommendations. We update your preference profile and refine the results.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
