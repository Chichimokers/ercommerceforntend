export async function getCategories() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://www.esaki-jrr.com/';
    const response = await fetch(`${baseUrl}categories`, {
      next: {
        revalidate: 3600,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching categories: ${response.status}`);
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}