"use client"
import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { User, Search, Clock, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Friend {
    borrowerName: string
    borrowerEmail: string
    borrowerPhone: string
}

interface RecentFriendsModalProps {
    userId: string
    userEmail?: string | null
    onSelectFriend: (friend: Friend) => void
}

export function RecentFriendsModal({
    userId,
    userEmail,
    onSelectFriend,
}: RecentFriendsModalProps) {
    const [open, setOpen] = useState(false)
    const [friends, setFriends] = useState<Friend[]>([])
    const [filteredFriends, setFilteredFriends] = useState<Friend[]>([])
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState("")

    useEffect(() => {
        if (open && userId) {
            fetchFriends()
        }
    }, [open, userId])

    useEffect(() => {
        if (search) {
            setFilteredFriends(
                friends.filter(
                    (friend) =>
                        friend.borrowerName.toLowerCase().includes(search.toLowerCase()) ||
                        friend.borrowerEmail.toLowerCase().includes(search.toLowerCase())
                )
            )
        } else {
            setFilteredFriends(friends)
        }
    }, [search, friends])

    const fetchFriends = async () => {
        setLoading(true)
        try {
            const emailParam = userEmail ? `&email=${encodeURIComponent(userEmail)}` : ""
            const response = await fetch(`/api/user/recent-friends?userId=${userId}${emailParam}`)
            if (response.ok) {
                const data = await response.json()
                setFriends(data.friends || [])
            }
        } catch (error) {
            console.error("Failed to fetch recent friends", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSelect = (friend: Friend) => {
        onSelectFriend(friend)
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Clock className="h-4 w-4" />
                    Recent Friend
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Recent Friends</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name or email..."
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <ScrollArea className="h-[300px] pr-4">
                        {loading ? (
                            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                Loading...
                            </div>
                        ) : filteredFriends.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center space-y-2 text-sm text-muted-foreground">
                                <User className="h-8 w-8 text-muted-foreground/50" />
                                <p>No recent friends found</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filteredFriends.map((friend, index) => (
                                    <button
                                        key={index}
                                        className="flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted"
                                        onClick={() => handleSelect(friend)}
                                    >
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            {friend.borrowerName.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <p className="truncate font-medium">
                                                {friend.borrowerName}
                                            </p>
                                            <p className="truncate text-xs text-muted-foreground">
                                                {friend.borrowerEmail}
                                            </p>
                                        </div>
                                        <Plus className="h-4 w-4 text-muted-foreground" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    )
}
