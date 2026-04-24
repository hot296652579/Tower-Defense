import { SkillData } from "../../game/skill/SkillData"

export class SkillComp {

    skills: Map<string, SkillData> = new Map()
    cooldown: Map<string, number> = new Map()

}