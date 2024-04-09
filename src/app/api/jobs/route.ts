export async function GET(request: Request) {
    const url = 'https://jsearch.p.rapidapi.com/search?query=software%20engineer%20jobs%20in%20New%20York%20usa&page=1&num_pages=1&date_posted=today&employment_types=INTERN%2C%20FULLTIME&job_requirements=no_experience%2C%20under_3_years_experience';
    const options: RequestInit = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || '',
            'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
        }
    };

    const response = await fetch(url, options);
    const data = await response.json();
    
    return Response.json(data);
}