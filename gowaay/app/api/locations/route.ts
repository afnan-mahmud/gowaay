export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const s = (searchParams.get('s') ?? '').toLowerCase();
  
  const all = [
    'Dhaka',
    'Chittagong', 
    'Sylhet',
    'Cox\'s Bazar',
    'Khulna',
    'Rajshahi',
    'Barishal',
    'Gazipur',
    'Rangpur',
    'Cumilla',
    'Narayanganj',
    'Mymensingh',
    'Jessore',
    'Comilla',
    'Nawabganj',
    'Dinajpur',
    'Bogra',
    'Pabna',
    'Brahmanbaria',
    'Tangail'
  ];
  
  const result = all
    .filter(city => city.toLowerCase().includes(s))
    .slice(0, 8)
    .map(name => ({
      label: name,
      value: name,
      id: name.toLowerCase().replace(/\s+/g, '-')
    }));
    
  return Response.json(result);
}
