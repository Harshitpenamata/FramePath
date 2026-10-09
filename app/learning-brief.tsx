'use client';
import {PlanSnapshot} from './plan-snapshot';
import React,{useState} from 'react';
import {Button} from '@/components/ui/button';
import {learnerBrief} from './learner-brief';
import {learningPhotos} from './visual-lab';
export function LearningBrief({profile,compact=false}:{profile:any;compact?:boolean}){return <PlanSnapshot profile={profile} compact={compact}/>;}
