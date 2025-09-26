export type Language = 'it' | 'en';

export type Region = {
  id: string;
  name: string;
  cities: City[];
};

export type City = {
  id: string;
  name: string;
};

export type PharmacySpecialization = 
  | 'preparazioni-galeniche'
  | 'nutrizione-oncologica'
  | 'supporto-post-chemioterapia'
  | 'presidi-medico-chirurgici';

export type PharmacySpecializationLabel = {
  [key in PharmacySpecialization]: {
    it: string;
    en: string;
  };
};

export type DoctorSpecialization =
  | 'breast-cancer'
  | 'lung-cancer'
  | 'gastrointestinal-cancer'
  | 'hematological-cancer'
  | 'pediatric-oncology'
  | 'gynecologic-oncology'
  | 'urologic-oncology'
  | 'neuro-oncology'
  | 'head-neck-oncology'
  | 'skin-cancer';

export type DoctorSpecializationLabel = {
  [key in DoctorSpecialization]: {
    it: string;
    en: string;
  };
};

export type ForumCategoryType =
  | 'breast-cancer'
  | 'lung-cancer'
  | 'leukemia'
  | 'therapies-treatments'
  | 'emotional-support'
  | 'nutrition'
  | 'caregivers'
  | 'clinical-trials';

export type ForumCategoryLabel = {
  [key in ForumCategoryType]: {
    it: string;
    en: string;
  };
};
