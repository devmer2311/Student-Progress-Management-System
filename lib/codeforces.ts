interface CodeforcesUser {
  handle: string;
  rating?: number;
  maxRating?: number;
}

interface CodeforcesContest {
  contestId: number;
  contestName: string;
  handle: string;
  rank: number;
  oldRating: number;
  newRating: number;
  ratingChange: number;
  participationType: string;
}

interface CodeforcesSubmission {
  id: number;
  contestId?: number;
  problem: {
    name: string;
    rating?: number;
  };
  verdict: string;
  programmingLanguage: string;
  creationTimeSeconds: number;
}

export class CodeforcesAPI {
  private static readonly BASE_URL = 'https://codeforces.com/api';

  static async getUserInfo(handle: string): Promise<CodeforcesUser | null> {
    try {
      const response = await fetch(`${this.BASE_URL}/user.info?handles=${handle}`);
      const data = await response.json();
      
      if (data.status === 'OK' && data.result.length > 0) {
        return data.result[0];
      }
      return null;
    } catch (error) {
      console.error('Error fetching user info:', error);
      return null;
    }
  }

  static async getUserRating(handle: string): Promise<CodeforcesContest[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/user.rating?handle=${handle}`);
      const data = await response.json();
      
      if (data.status === 'OK') {
        return data.result;
      }
      return [];
    } catch (error) {
      console.error('Error fetching user rating:', error);
      return [];
    }
  }

  static async getUserSubmissions(handle: string, from = 1, count = 100000): Promise<CodeforcesSubmission[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/user.status?handle=${handle}&from=${from}&count=${count}`);
      const data = await response.json();
      
      if (data.status === 'OK') {
        return data.result;
      }
      return [];
    } catch (error) {
      console.error('Error fetching user submissions:', error);
      return [];
    }
  }
}