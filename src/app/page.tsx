import UrlShortenerForm from "@/components/url-shortener-form";

export default async function Home() {
  return (
    <div className="flex justify-center p-6 bg-gray-100 dark:bg-gray-900">
      <UrlShortenerForm />
    </div>
  );
}
