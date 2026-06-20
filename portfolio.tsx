"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ExternalLink, Github, Linkedin, Mail, Phone, Star, Trophy, MapPin, Building, GitFork, BookOpen, Code, Zap, Menu, X, Download } from 'lucide-react'
import Link from "next/link"
import { useState } from "react"
import Chatbot from "@/components/chatbot"
import AnimatedBackground from "@/components/animated-background"

/* eslint-disable @typescript-eslint/no-explicit-any */
interface PortfolioProps {
  data?: any
}

export default function Component({ data }: PortfolioProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Function to handle resume download
  const handleDownloadResume = () => {
    window.location.href = "/api/download/resume";
  }

  const languageColors: Record<string, string> = {
    Python: "#3572A2",
    JavaScript: "#f1e05a",
    TypeScript: "#2b7489",
    C: "#555555",
    "C++": "#f34b7d",
    Java: "#b07219",
    HTML: "#e34c26",
    CSS: "#563d7c",
    "Jupyter Notebook": "#DA5B0B",
    Shell: "#89e051",
    Go: "#00ADD8",
    Rust: "#dea584",
    Ruby: "#701516",
    PHP: "#4F5D95",
    Swift: "#ffac45",
    Kotlin: "#A97BFF",
    default: "#6e7681",
  };

  // Use data from props (JSON file) or fallback defaults
  const profile = data?.profile || { name: "Farhan", username: "theNahraf", tagline: "🚀 Software Engineer", bio: "", detailedBio: "", detailedBioSub: "", institution: "NSUT", location: "New Delhi, India", email: "farhan.techcareer@gmail.com", phone: "8XXXXXXXX", avatarFallback: "F" }
  const socialLinks = data?.socialLinks || { github: "https://github.com/urraf", linkedin: "https://www.linkedin.com/in/nahrafxd", twitter: "https://www.x.com/urrafx", linkedinDisplay: "linkedin.com/in/nahrafxd", leetcode: "https://www.leetcode.com/u/urraf" }
  const stats = data?.stats || [{ value: "25+", label: "Github Repos", color: "text-white" }, { value: "1.8k", label: "LeetCode Rating", color: "text-[#ffa116]" }, { value: "1000+", label: "Codeforces", color: "text-[#1f8acb]" }, { value: "700+", label: "Problems Solved", color: "text-[#2ea043]" }]
  const projects: any[] = data?.projects || []
  const experiences: any[] = data?.experiences || []
  const skills: Record<string, string[]> = data?.skills || {}
  const achievements: string[] = data?.achievements || []
  const codingStats: any[] = data?.codingStats || []
  const education: any = data?.education || { degree: "Bachelor of Technology", field: "Information Technology", institution: "Netaji Subhas University of Technology, New Delhi", period: "2023 - 2027", coursework: [] }
  const profileImageUrl = data?.profileImageUrl || "/profile2.jpeg"

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] w-full overflow-x-hidden relative">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Header */}
      <header className="border-b border-[#21262d] bg-[#010409] px-2 sm:px-4 py-2 sm:py-4 sticky top-0 z-50 w-full">
        <div className="mx-auto max-w-7xl w-full">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <Avatar className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0 ">
                <AvatarImage src={profileImageUrl} alt={profile.name} className="object-cover" />
                <AvatarFallback className="bg-[#21262d] text-white text-xs sm:text-sm">{profile.avatarFallback}</AvatarFallback>
              </Avatar>
              <span className="text-white font-medium text-xs sm:text-base truncate">{profile.name}</span>
              <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-sm ml-4 lg:ml-6">
                <Link href="#overview" className="text-[#e6edf3] hover:text-white transition-colors whitespace-nowrap">
                  Overview
                </Link>
                <Link
                  href={socialLinks.github}
                  target="_blank" rel="noopener noreferrer"
                  className="text-[#7d8590] hover:text-white transition-colors whitespace-nowrap"
                >
                  Github
                </Link>
                <Link href={socialLinks.linkedin}
                  target="_blank" rel="noopener noreferrer"
                  className="text-[#7d8590] hover:text-white transition-colors whitespace-nowrap">
                  Linkedin
                </Link>
                <Link href={socialLinks.twitter}
                  target="_blank" rel="noopener noreferrer"
                  className="text-[#7d8590] hover:text-white transition-colors whitespace-nowrap">
                  Twitter
                </Link>
                <Link href="/blog"
                  className="text-[#7d8590] hover:text-white transition-colors whitespace-nowrap">
                  Blog
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <Button
                size="sm"
                onClick={handleDownloadResume}
                className="bg-[#238636] hover:bg-[#2ea043] text-white border-0 hidden sm:flex text-xs px-2 sm:px-3 py-1 sm:py-1.5 h-7 sm:h-8"
              >
                <Download className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Resume</span>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="md:hidden text-[#e6edf3] hover:bg-[#21262d] p-1 h-7 w-7 sm:h-8 sm:w-8"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-3 w-3 sm:h-4 sm:w-4" /> : <Menu className="h-3 w-3 sm:h-4 sm:w-4" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-[#21262d] w-full">
              <nav className="flex flex-col gap-2 sm:gap-3 text-sm w-full">
                <Link href="#overview" className="text-[#e6edf3] hover:text-white transition-colors py-1 w-full">
                  Overview
                </Link>
                <Link href={socialLinks.github}
                  target="_blank" rel="noopener noreferrer"
                  className="text-[#7d8590] hover:text-white transition-colors py-1 w-full">
                  Github
                </Link>
                <Link
                  href={socialLinks.linkedin}
                  target="_blank" rel="noopener noreferrer"
                  className="text-[#7d8590] hover:text-white transition-colors py-1 w-full">
                  Linkedin
                </Link>
                <Link href={socialLinks.twitter}
                  target="_blank" rel="noopener noreferrer"
                  className="text-[#7d8590] hover:text-white transition-colors py-1 w-full">
                  Twitter
                </Link>
                <Button
                  size="sm"
                  onClick={handleDownloadResume}
                  className="bg-[#238636] hover:bg-[#2ea043] text-white border-0 text-xs px-3 py-1.5 w-fit mt-1"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download Resume
                </Button>
              </nav>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-2 sm:px-4 py-3 sm:py-6 lg:py-8 w-full relative z-10">
        {/* Mobile Profile Header */}
        <div className="lg:hidden mb-8 sm:mb-10 w-full mt-2">
          <div className="flex flex-col items-center text-center space-y-4 sm:space-y-6 w-full">
            <Avatar className="h-28 w-28 sm:h-40 sm:w-40 flex-shrink-0 border-4 border-[#30363d] shadow-lg shadow-[#58a6ff]/10">
              <AvatarImage src={profileImageUrl} alt={profile.name} className="object-cover" />
              <AvatarFallback className="bg-[#21262d] text-3xl sm:text-4xl text-white">{profile.avatarFallback}</AvatarFallback>
            </Avatar>
            <div className="w-full max-w-sm mx-auto px-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 tracking-tight">{profile.name}</h1>
              <Link href={socialLinks.github} className="text-base sm:text-lg text-[#58a6ff] hover:text-[#79c0ff] font-medium mb-3 block transition-colors">@{profile.username}</Link>
              <div className="text-sm sm:text-base text-[#e6edf3] mb-6 leading-relaxed bg-[#161b22]/40 border border-[#30363d] p-4 sm:p-5 rounded-2xl shadow-sm backdrop-blur-sm">
                {profile.tagline}
                <p className="text-[#8b949e] mt-2 font-medium">{profile.bio}</p>
              </div>
              <Button
                onClick={handleDownloadResume}
                className="bg-gradient-to-r from-[#238636] to-[#2ea043] hover:from-[#2ea043] hover:to-[#3fb950] text-white border-0 text-base sm:text-lg px-6 py-6 sm:py-7 w-full shadow-lg shadow-[#238636]/20 transition-all font-semibold rounded-xl"
              >
                <Download className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                Download Resume
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:gap-6 lg:gap-8 lg:grid-cols-4 w-full">
          {/* Left Sidebar - Hidden on mobile, shown in main content */}
          <div className="hidden lg:block lg:col-span-1 space-y-6">
            {/* Desktop Profile Card */}
            <div className="space-y-4">
              <Avatar className="h-64 w-64 mx-auto xl:h-72 xl:w-72 ">
                <AvatarImage src={profileImageUrl} alt={profile.name} className="object-cover" />
                <AvatarFallback className="bg-[#21262d] text-5xl xl:text-6xl text-white">{profile.avatarFallback}</AvatarFallback>
              </Avatar>

              <div className="text-center xl:text-left">
                <h1 className="text-2xl font-semibold text-white mb-1">{profile.name}</h1>
                <Link href={socialLinks.github} className="text-xl text-[#00e2e8] mb-3">Github</Link>
                <div className="text-[#e6edf3] font-bold mb-4 leading-relaxed">
                  {profile.detailedBio}
                  <p className="text-gray-500 mt-3">{profile.detailedBioSub}
                  </p>
                </div>

                <Button
                  onClick={handleDownloadResume}
                  className="w-full bg-[#238636] hover:bg-[#2ea043] text-white border-0 mb-4"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Resume
                </Button>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-[#7d8590] justify-center xl:justify-start">
                    <Building className="h-4 w-4 flex-shrink-0" />
                    <span>{profile.institution}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#7d8590] justify-center xl:justify-start">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span>{profile.location}</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center xl:justify-start">
                    <Mail className="h-4 w-4 flex-shrink-0" />
                    <Link
                      href={`mailto:${profile.email}`}
                      className="text-[#58a6ff] hover:underline text-xs break-all"
                    >
                      {profile.email}
                    </Link>
                  </div>
                  <div className="flex items-center gap-2 justify-center xl:justify-start">
                    <Linkedin className="h-4 w-4 flex-shrink-0" />
                    <Link href={socialLinks.linkedin} className="text-[#58a6ff] hover:underline text-xs">
                      {socialLinks.linkedinDisplay}
                    </Link>
                  </div>
                  <div className="flex items-center gap-2 text-[#7d8590] justify-center xl:justify-start">
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <span>{profile.phone}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Coding Platform Stats */}
            <Card className="bg-[#161b22] border-[#30363d]">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-base">Coding Platforms</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {codingStats.map((stat: any, index: number) => (
                  <Link key={index} href={stat.url}>
                    <div className={`mb-3 p-3 rounded-lg border ${stat.bgColor} ${stat.borderColor}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-white text-sm">{stat.platform}</span>
                        <span className={`text-sm font-bold ${stat.color}`}>{stat.rating}</span>
                      </div>
                      <div className="text-xs text-[#7d8590]">{stat.problems} problems solved</div>
                    </div>
                  </Link>

                ))}
              </CardContent>
            </Card>

            {/* Desktop Achievements */}
            <Card className="bg-[#161b22] border-[#30363d]">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-base">
                  <Trophy className="h-4 w-4 text-[#ffa657]" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-3">
                  {achievements.map((achievement: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Star className="h-3 w-3 text-[#ffa657] mt-1 flex-shrink-0" />
                      <span className="text-[#e6edf3] leading-relaxed">{achievement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Desktop Technical Skills */}
            <Card className="bg-[#161b22] border-[#30363d]">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-base">Technical Skills</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                {Object.entries(skills).map(([category, items]) => (
                  <div key={category}>
                    <h4 className="font-medium text-white text-sm mb-2">{category}</h4>
                    <div className="flex flex-wrap gap-1">
                      {(items as string[]).map((skill: string) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="bg-[#21262d] text-[#58a6ff] border-[#30363d] text-xs hover:bg-[#30363d] transition-colors"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-3 sm:space-y-6 w-full min-w-0">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full">
              {stats.map((stat: { value: string; label: string; color: string }, index: number) => (
                <Card key={index} className="bg-[#161b22] border-[#30363d] hover:border-[#58a6ff] transition-all hover:bg-[#1f242c] min-w-0 shadow-sm rounded-xl">
                  <CardContent className="p-4 sm:p-5 text-center flex flex-col justify-center h-full">
                    <div className={`text-xl sm:text-2xl lg:text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                    <div className="text-xs sm:text-sm text-[#7d8590] truncate font-medium">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Contribution Graph */}
            {/* <div className="w-full">
              <ContributionGraph />
            </div> */}

            {/* Mobile Coding Platform Stats */}
            <div className="lg:hidden w-full">
              <Card className="bg-[#161b22] border-[#30363d] rounded-xl shadow-sm">
                <CardHeader className="pb-3 pt-5 px-5">
                  <CardTitle className="text-white text-base font-semibold">Coding Platforms</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-3 px-5 pb-5">
                  {codingStats.map((stat: any, index: number) => (
                    <Link key={index} href={stat.url} className="block">
                      <div className={`p-3 sm:p-4 rounded-xl border ${stat.bgColor} ${stat.borderColor} transition-all hover:scale-[1.02]`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-white text-sm sm:text-base">{stat.platform}</span>
                          <span className={`text-sm sm:text-base font-bold ${stat.color}`}>{stat.rating}</span>
                        </div>
                        <div className="text-sm text-[#7d8590] font-medium">{stat.problems} problems solved</div>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Mobile Contact Info */}
            <div className="lg:hidden w-full">
              <Card className="bg-[#161b22] border-[#30363d] rounded-xl shadow-sm">
                <CardHeader className="pb-3 pt-5 px-5">
                  <CardTitle className="text-white text-base font-semibold">Contact</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 px-5 pb-5">
                  <div className="grid grid-cols-1 gap-4 sm:gap-5 text-sm sm:text-base">
                    <div className="flex items-center gap-3 text-[#e6edf3]">
                      <div className="p-2 bg-[#21262d] rounded-lg border border-[#30363d]">
                        <Building className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 text-[#7d8590]" />
                      </div>
                      <span className="font-medium">{profile.institution}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[#e6edf3]">
                      <div className="p-2 bg-[#21262d] rounded-lg border border-[#30363d]">
                        <MapPin className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 text-[#7d8590]" />
                      </div>
                      <span className="font-medium">{profile.location}</span>
                    </div>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 bg-[#21262d] rounded-lg border border-[#30363d]">
                        <Mail className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 text-[#7d8590]" />
                      </div>
                      <Link
                        href={`mailto:${profile.email}`}
                        className="text-[#58a6ff] hover:text-[#79c0ff] hover:underline break-all min-w-0 font-medium"
                      >
                        {profile.email}
                      </Link>
                    </div>
                    <div className="flex items-center gap-3 text-[#e6edf3]">
                      <div className="p-2 bg-[#21262d] rounded-lg border border-[#30363d]">
                        <Phone className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 text-[#7d8590]" />
                      </div>
                      <span className="font-medium">{profile.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 bg-[#21262d] rounded-lg border border-[#30363d]">
                        <Linkedin className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 text-[#7d8590]" />
                      </div>
                      <Link
                        href={socialLinks.linkedin}
                        className="text-[#58a6ff] hover:text-[#79c0ff] hover:underline truncate min-w-0 font-medium"
                      >
                        {socialLinks.linkedinDisplay}
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Mobile Technical Skills */}
            <div className="lg:hidden w-full">
              <Card className="bg-[#161b22] border-[#30363d] rounded-xl shadow-sm">
                <CardHeader className="pb-3 pt-5 px-5">
                  <CardTitle className="text-white text-base font-semibold">Technical Skills</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-5 px-5 pb-5">
                  {Object.entries(skills).map(([category, items]) => (
                    <div key={category} className="w-full">
                      <h4 className="font-semibold text-white text-sm sm:text-base mb-3">{category}</h4>
                      <div className="flex flex-wrap gap-2">
                        {(items as string[]).map((skill: string) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="bg-[#21262d] text-[#58a6ff] border-[#30363d] text-sm hover:bg-[#30363d] transition-colors py-1 px-3 shadow-none"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Education */}
            <Card className="bg-[#161b22] border-[#30363d] w-full shadow-sm rounded-xl">
              <CardHeader className="pb-3 pt-5 px-5">
                <CardTitle className="text-white flex items-center gap-2 text-base font-semibold">
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-5 pb-5">
                <div className="border-l-2 border-[#30363d] pl-4 sm:pl-5">
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white text-sm sm:text-base lg:text-lg">
                            {education.degree}
                          </h3>
                          <p className="text-[#58a6ff] text-sm sm:text-base">{education.field}</p>
                          <p className="text-[#7d8590] text-xs sm:text-sm">{education.institution}</p>
                        </div>
                        <Badge
                          variant="outline"
                          className="border-[#30363d] text-[#7d8590] text-xs sm:text-sm w-fit flex-shrink-0"
                        >
                          {education.period}
                        </Badge>
                      </div>
                      <div className="mt-3 sm:mt-4">
                        <h4 className="font-medium text-white text-sm sm:text-base mb-3">Relevant Coursework</h4>
                        <div className="flex flex-wrap gap-2">
                          {(education.coursework || []).map((course: string) => (
                            <Badge
                              key={course}
                              variant="outline"
                              className="text-xs sm:text-sm py-1 px-3 border-[#30363d] text-[#7d8590] hover:border-[#58a6ff] hover:text-[#58a6ff] transition-colors"
                            >
                              {course}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Experience */}
            <Card className="bg-[#161b22] border-[#30363d] w-full shadow-sm rounded-xl">
              <CardHeader className="pb-3 pt-5 px-5">
                <CardTitle className="text-white flex items-center gap-2 text-base font-semibold">
                  <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
                  Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-6 sm:space-y-8 px-5 pb-5">
                {experiences.map((exp, index) => (
                  <div key={index} className="border-l-2 border-[#30363d] pl-4 sm:pl-5 space-y-3 sm:space-y-4">
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white text-sm sm:text-base lg:text-lg">{exp.title}</h3>
                            <div className="flex flex-col gap-1 text-sm text-[#7d8590] mt-1.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[#58a6ff] font-medium">{exp.company}</span>
                                <span className="hidden sm:inline">•</span>
                                <span className="break-all">{exp.url == "" && exp.location}</span>
                                <Link
                                  href={exp.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-400 hover:underline hover:text-blue-300 transition-colors"
                                >
                                  {exp.location === "" && exp.url}
                                </Link>
                              </div>
                              <Badge
                                variant="outline"
                                className="border-[#30363d] text-[#7d8590] text-xs sm:text-sm w-fit flex-shrink-0 mt-1"
                              >
                                {exp.type}
                              </Badge>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className="w-fit text-xs sm:text-sm border-[#30363d] text-[#7d8590] flex-shrink-0"
                          >
                            {exp.period}
                          </Badge>
                        </div>
                        <ul className="space-y-2 text-sm sm:text-base text-[#e6edf3] mt-2">
                          {exp.description.map((item: string, i: number) => (
                            <li key={i} className="flex items-start gap-3">
                              <span className="text-[#58a6ff] mt-1 text-sm flex-shrink-0">▹</span>
                              <span className="leading-relaxed">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Featured Projects */}
            <Card className="bg-[#161b22] border-[#30363d] w-full shadow-sm rounded-xl">
              <CardHeader className="pb-3 pt-5 px-5">
                <CardTitle className="text-white flex items-center gap-2 text-base font-semibold">
                  <Code className="h-4 w-4 sm:h-5 sm:w-5" />
                  Featured Projects
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4 sm:space-y-6 px-4 sm:px-5 pb-5">
                {projects.map((project, index) => (
                  <div
                    key={index}
                    className="border border-[#30363d] rounded-xl p-4 sm:p-6 hover:border-[#58a6ff] hover:bg-[#1f242c] transition-all w-full shadow-sm"
                  >
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-3">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 min-w-0">
                              <Link href={project.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-bold text-[#58a6ff] hover:text-[#79c0ff] hover:underline cursor-pointer text-base sm:text-lg lg:text-xl truncate transition-colors">
                                {project.title}
                              </Link>
                              <Badge
                                variant="outline"
                                className="border-[#30363d] text-[#7d8590] text-xs sm:text-sm w-fit flex-shrink-0"
                              >
                                Public
                              </Badge>
                            </div>
                            <div className="flex gap-2 sm:gap-3 flex-shrink-0 pt-1 sm:pt-0">
                              <Button
                                size="sm"
                                variant="outline"
                                asChild
                                className="border-[#30363d] text-[#e6edf3] hover:bg-[#21262d] bg-transparent text-xs sm:text-sm px-3 py-1.5 h-8 sm:h-9"
                              >
                                <Link href={project.github}>
                                  <Github className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                                  Code
                                </Link>
                              </Button>
                              {project.demo && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  asChild
                                  className="border-[#30363d] text-[#e6edf3] hover:bg-[#21262d] bg-transparent text-xs sm:text-sm px-3 py-1.5 h-8 sm:h-9"
                                >
                                  <Link href={project.demo}>
                                    <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                                    Live
                                  </Link>
                                </Button>
                              )}
                            </div>
                          </div>

                          <p className="text-[#e6edf3] text-sm sm:text-base leading-relaxed mt-1">{project.description}</p>

                          <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-[#7d8590] mt-1 font-medium">
                            <div className="flex items-center gap-1.5">
                              <div
                                className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: languageColors[project.language] || languageColors.default }}
                              />

                              <span>{project.language}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Star className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                              <span>{project.stars}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <GitFork className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                              <span>{project.forks}</span>
                            </div>
                            <span className="truncate">Updated {project.date}</span>
                          </div>

                          <div className="flex flex-wrap gap-2 mt-1">
                            {project.tech.map((tech: string) => (
                              <Badge
                                key={tech}
                                variant="secondary"
                                className="bg-[#21262d] text-[#58a6ff] border-[#30363d] text-xs sm:text-sm hover:bg-[#30363d] transition-colors py-1 px-2.5 shadow-none"
                              >
                                {tech}
                              </Badge>
                            ))}
                          </div>

                          <ul className="space-y-2 text-sm sm:text-base text-[#8b949e] mt-3">
                            {project.highlights.map((highlight: string, i: number) => (
                              <li key={i} className="flex items-start gap-3">
                                <span className="mt-1 text-sm flex-shrink-0 text-[#58a6ff]">▹</span>
                                <span className="leading-relaxed">{highlight}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Mobile Achievements */}
            <div className="lg:hidden w-full">
              <Card className="bg-[#161b22] border-[#30363d] rounded-xl shadow-sm">
                <CardHeader className="pb-3 pt-5 px-5">
                  <CardTitle className="text-white flex items-center gap-2 text-base font-semibold">
                    <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-[#ffa657]" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 px-5 pb-5">
                  <ul className="space-y-4 sm:space-y-5">
                    {achievements.map((achievement, index) => (
                      <li key={index} className="flex items-start gap-3 text-sm sm:text-base">
                        <Star className="h-4 w-4 sm:h-5 sm:w-5 text-[#ffa657] mt-0.5 flex-shrink-0" />
                        <span className="text-[#e6edf3] leading-relaxed font-medium">{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#21262d] bg-[#010409] px-2 sm:px-4 py-4 sm:py-6 mt-6 sm:mt-8 w-full relative z-10">
        <div className="mx-auto max-w-7xl w-full">
          <div className="flex flex-col items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                href={socialLinks.github}
                className="text-[#7d8590] hover:text-[#58a6ff] transition-colors"
              >
                <Github className="h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
              <Link
                href={socialLinks.linkedin}
                className="text-[#7d8590] hover:text-[#58a6ff] transition-colors"
              >
                <Linkedin className="h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
              <Link
                href={`mailto:${profile.email}`}
                className="text-[#7d8590] hover:text-[#58a6ff] transition-colors"
              >
                <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </div>
            <span className="text-[#7d8590] text-xs sm:text-sm text-center px-2">
              Crafted with care by {profile.name} • 2025
            </span>
          </div>
        </div>
      </footer>

      {/* AI Chatbot */}
      <Chatbot
        portfolioData={{
          projects,
          experiences,
          skills,
          achievements
        }}
      />
    </div>
  )
}