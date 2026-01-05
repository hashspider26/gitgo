export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50/50 py-12 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-black dark:text-zinc-400">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-4">
        <div className="flex flex-col gap-4">
          <span className="font-bold text-lg text-primary">Green Valley Seeds</span>
          <p className="text-zinc-500">
            Bringing nature to your doorstep. Wide variety of high-quality seeds and gardening tools.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-semibold text-zinc-900 dark:text-white">Shop</h3>
          <a href="/shop?category=seeds" className="hover:text-primary transition-colors">Seeds</a>
          <a href="/shop?category=tools" className="hover:text-primary transition-colors">Tools</a>
          <a href="/shop?category=pots" className="hover:text-primary transition-colors">Pots & Planters</a>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-semibold text-zinc-900 dark:text-white">Company</h3>
          <a href="/about" className="hover:text-primary transition-colors">About Us</a>
          <a href="/contact" className="hover:text-primary transition-colors">Contact</a>
          <a href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</a>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="font-semibold text-zinc-900 dark:text-white">Contact</h3>
          <p>Mianwali, Punjab, Pakistan</p>
          <p>0370-7963625</p>
          <p>fr56123213@gmail.com</p>
        </div>
      </div>
      <div className="mx-auto mt-12 max-w-6xl border-t border-zinc-200 pt-8 px-4 text-center dark:border-zinc-800">
        <p>© {new Date().getFullYear()} Green Valley Seeds. All rights reserved.</p>
      </div>
    </footer>
  );
}
