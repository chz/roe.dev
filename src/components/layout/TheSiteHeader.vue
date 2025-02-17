<script setup lang="ts">
const config = useRuntimeConfig()
const redirect = process.dev
  ? `&redirect_uri=http://localhost:3000/auth/github`
  : ''
const loginURL = `https://github.com/login/oauth/authorize?client_id=${config.public.githubClientId}${redirect}&scope=read:org`

const showMenu = ref(false)

const menu = [
  {
    name: 'Home',
    path: '/',
  },
  {
    name: 'Work',
    path: '/work',
  },
  {
    name: 'Talks',
    path: '/talks',
  },
  {
    name: 'Uses',
    path: '/uses',
  },
  {
    name: 'Feed',
    path: '/feed',
  },
  {
    name: 'Blog',
    path: '/blog',
  },
]

useRouter().afterEach(() => {
  toggleMenu(false)
})

watch(showMenu, value => {
  document.body.classList.toggle('overflow-hidden', value)
})

function toggleMenu(input?: Event | boolean) {
  const newValue = typeof input === 'boolean' ? input : !showMenu.value
  if (process.server || input === showMenu.value) return
  if (document.startViewTransition) {
    document.startViewTransition(async () => {
      showMenu.value = newValue
      await nextTick()
    })
  } else {
    showMenu.value = newValue
  }
}
</script>

<template>
  <nav
    class="p-2 uppercase bg-gray-900 flex flex-row justify-between items-center text-white md:p-4 tracking-[0.15rem]"
  >
    <ul
      class="font-semibold flex-grow text-xs md:text-base justify-between flex flex-row items-center md:flex-grow-0"
    >
      <li>
        <NuxtLink
          class="underlined-link px-2 py-2"
          :class="{
            'not-[:hover,:focus,:active]:after:border-transparent':
              $route.path !== '/',
          }"
          to="/"
          title="Daniel Roe"
        >
          DCR
        </NuxtLink>
      </li>
      <template v-for="link in menu.slice(1)" :key="link.name">
        <li aria-hidden="true" class="hidden md:inline-block font-bold">•</li>
        <li>
          <NuxtLink
            class="underlined-link hidden md:inline-block px-2 py-2"
            :class="{
              'not-[:hover,:focus,:active]:after:border-transparent':
                $route.path !== link.path,
            }"
            :to="link.path"
          >
            {{ link.name }}
          </NuxtLink>
        </li>
      </template>
    </ul>
    <div
      class="ml-2 mr-1 flex md:gap-2 flex-shrink-0 items-center justify-between"
    >
      <div
        v-if="$auth.status === 'pending'"
        class="flex items-center justify-center w-[2rem] flex-shrink-0"
      >
        <span class="h-6 w-6 i-svg-spinners:90-ring-with-bg" alt="" />
        <span class="sr-only"> Loading </span>
      </div>
      <NuxtLink
        v-else-if="$auth.status === 'logged-out'"
        :to="loginURL"
        class="-mr-1 -mt-1 p-1 w-[2rem] flex-shrink-0"
        @click="$auth.status = 'pending'"
      >
        <span class="h-5 w-5 i-ri:github-fill" alt="" />
        <span class="sr-only"> Login </span>
      </NuxtLink>
      <button
        v-else-if="$auth.status === 'logged-in'"
        type="button"
        class="relative flex-shrink-0 w-[2rem]"
        @click="$auth.logout"
      >
        <img
          class="h-6 w-6 rounded-full"
          :class="{ 'border-[1px] border-yellow-400': $auth.user.sponsor }"
          :src="$auth.user.avatar"
        />
        <span
          v-if="$auth.user.sponsor"
          class="absolute top-[-0.45rem] right-[-0.2rem] h-5 w-5 text-yellow-400"
          alt=""
        >
          <span class="i-ri:star-fill border border-solid border-gray-800" />
        </span>
        <span class="sr-only"> Log out {{ $auth.user.name }} </span>
      </button>
      <div class="md:hidden">
        <button type="button" @click="toggleMenu">
          <span
            class="menu-icon h-6 w-6 i-ri:add-line"
            :style="{ viewTransitionName: showMenu ? undefined : 'menu' }"
            alt=""
          />
          <span class="sr-only"> Open mobile navigation menu </span>
        </button>
        <Teleport v-if="showMenu" to="body">
          <nav
            class="inset-0 fixed bg-accent text-muted z-10 flex flex-col justify-center items-center"
          >
            <button
              type="button"
              class="top-0 right-0 fixed p-8"
              @click="toggleMenu"
            >
              <span
                class="menu-icon h-8 w-8 i-ri:close-fill"
                :style="{ viewTransitionName: 'menu' }"
                alt=""
              />
              <span class="sr-only"> Close mobile navigation menu </span>
            </button>
            <ul
              class="uppercase font-semibold tracking-[0.15rem] max-w-xl text-2xl flex flex-col items-center gap-6"
            >
              <li v-for="link in menu" :key="link.name">
                <NuxtLink
                  class="underlined-link px-2 py-2"
                  :class="{
                    'not-[:hover,:focus,:active]:after:border-transparent':
                      $route.path !== link.path,
                  }"
                  :to="link.path"
                >
                  {{ link.name }}
                </NuxtLink>
              </li>
              <li><ToggleColorMode /></li>
            </ul>
          </nav>
        </Teleport>
      </div>
      <ToggleColorMode class="hidden md:flex" />
    </div>
  </nav>
</template>

<style>
::view-transition-old(menu) {
  transform: rotate(0deg);
}

::view-transition-new(menu) {
  transform: rotate(90deg);
}
</style>
